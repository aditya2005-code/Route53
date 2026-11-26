import json
import logging
from typing import Optional, List, Dict, Any
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.config import settings
from app.core.exceptions import ResourceNotFoundException
from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord
from app.schemas.troubleshoot import (
    TroubleshootRequest,
    TroubleshootResponse,
    SeverityLevel,
)

logger = logging.getLogger(__name__)


class TroubleshootService:
    def __init__(self, db: Session):
        self.db = db

    def _fetch_user_zone_context(
        self, user_id: int, zone_id: Optional[int]
    ) -> Optional[Dict[str, Any]]:
        if zone_id is None:
            # Optionally grab the user's first zone if available
            zone = self.db.execute(
                select(HostedZone).where(HostedZone.user_id == user_id).limit(1)
            ).scalar_one_or_none()
            if not zone:
                return None
        else:
            zone = self.db.execute(
                select(HostedZone).where(
                    HostedZone.id == zone_id, HostedZone.user_id == user_id
                )
            ).scalar_one_or_none()
            if not zone:
                raise ResourceNotFoundException("Hosted zone not found or access denied.")

        records = self.db.execute(
            select(DNSRecord).where(DNSRecord.hosted_zone_id == zone.id)
        ).scalars().all()

        return {
            "zone_id": zone.id,
            "domain_name": zone.domain_name,
            "description": zone.description,
            "total_records": len(records),
            "records": [
                {
                    "id": r.id,
                    "record_name": r.record_name,
                    "record_type": r.record_type,
                    "value": r.value,
                    "ttl": r.ttl,
                    "priority": r.priority,
                }
                for r in records
            ],
        }

    def troubleshoot(
        self, user_id: int, request: TroubleshootRequest
    ) -> TroubleshootResponse:
        zone_context = self._fetch_user_zone_context(user_id, request.zone_id)

        # 1. Try OpenAI if API key is configured
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip():
            try:
                ai_result = self._call_openai(request, zone_context)
                if ai_result:
                    ai_result.zone_context = zone_context
                    return ai_result
            except Exception as e:
                logger.warning(
                    f"OpenAI call failed ({str(e)}), falling back to rule-based diagnostic engine."
                )

        # 2. Rule-based diagnostic fallback
        fallback_result = self._rule_based_diagnosis(request, zone_context)
        fallback_result.zone_context = zone_context
        return fallback_result

    def _call_openai(
        self, request: TroubleshootRequest, zone_context: Optional[Dict[str, Any]]
    ) -> Optional[TroubleshootResponse]:
        system_prompt = (
            "You are a Senior Principal Cloud DNS Architect and Troubleshooting Specialist for AWS Route 53. "
            "Analyze the user's reported DNS problem and the provided verified database configuration facts. "
            "Return a strictly valid JSON object matching this schema:\n"
            "{\n"
            '  "problem": "Clear, concise statement of the identified issue",\n'
            '  "possible_causes": ["Cause 1", "Cause 2", ...],\n'
            '  "analysis": "In-depth technical explanation referencing DNS RFCs, TTL caching, resolver behavior, or record syntax",\n'
            '  "recommended_actions": ["Action 1", "Action 2", ...],\n'
            '  "severity": "low" | "medium" | "high",\n'
            '  "requires_manual_verification": true\n'
            "}\n"
            "Rules:\n"
            "- Never fabricate records that do not exist in the verified database facts.\n"
            "- Never execute or tell the system to auto-apply modifications.\n"
            "- Clearly distinguish verified database facts from hypotheses.\n"
            "- Ensure severity is accurately assessed (NXDOMAIN on production = high, caching = low)."
        )

        user_content = {
            "user_query": request.query,
            "target_record_name": request.record_name,
            "target_record_type": request.record_type.value if request.record_type else None,
            "verified_database_facts": zone_context if zone_context else "No hosted zone context provided.",
        }

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY.strip()}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.OPENAI_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(user_content)},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
            "max_tokens": 1200,
        }

        with httpx.Client(timeout=15.0) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            content_str = data["choices"][0]["message"]["content"]
            parsed = json.loads(content_str)

            severity = parsed.get("severity", "medium").lower()
            if severity not in {"low", "medium", "high"}:
                severity = "medium"

            return TroubleshootResponse(
                problem=parsed.get("problem", "DNS Resolution Diagnostic Issue"),
                possible_causes=parsed.get("possible_causes", ["Configuration discrepancy detected."]),
                analysis=parsed.get("analysis", "Diagnostic review based on DNS records."),
                recommended_actions=parsed.get("recommended_actions", ["Verify registrar nameserver delegation."]),
                severity=SeverityLevel(severity),
                requires_manual_verification=True,
            )

    def _rule_based_diagnosis(
        self, request: TroubleshootRequest, zone_context: Optional[Dict[str, Any]]
    ) -> TroubleshootResponse:
        query_lower = request.query.lower()
        records = zone_context.get("records", []) if zone_context else []
        domain_name = zone_context.get("domain_name", "your domain") if zone_context else "your domain"

        record_types = {r["record_type"] for r in records}
        record_names = {r["record_name"] for r in records}

        # Issue 1: CNAME issues
        if "cname" in query_lower:
            cname_records = [r for r in records if r["record_type"] == "CNAME"]
            apex_cname = [r for r in cname_records if r["record_name"] in {"@", domain_name}]

            causes = [
                "CNAME record pointing to an unreachable or non-existent canonical target.",
                "RFC 1034 CNAME collision: A CNAME record cannot coexist with any other record type on the same label.",
                "CNAME at apex/zone apex: standard DNS specification prohibits CNAME at zone apex (@).",
            ]
            if apex_cname:
                causes.insert(0, f"Apex CNAME detected on '{apex_cname[0]['record_name']}', which violates RFC 1034.")

            actions = [
                "Verify the target hostname of your CNAME record resolves to valid IP addresses.",
                "Do not place a CNAME record at the zone apex (@); use an 'A' record or Route 53 ALIAS instead.",
                "Check that no other record (TXT, MX, etc.) shares the exact same label as your CNAME record.",
            ]

            return TroubleshootResponse(
                problem=f"CNAME Alias Resolution Misconfiguration for {domain_name}",
                possible_causes=causes,
                analysis=(
                    f"Under RFC 1034 Section 3.6.2, if a CNAME record is present at a node, no other data may exist "
                    f"for that node. Zone '{domain_name}' currently contains {len(cname_records)} CNAME record(s). "
                    "Ensure canonical targets end with a fully qualified domain name and resolve correctly."
                ),
                recommended_actions=actions,
                severity=SeverityLevel.MEDIUM,
                requires_manual_verification=True,
            )

        # Issue 2: NXDOMAIN or domain not resolving
        if "nxdomain" in query_lower or "not resolving" in query_lower or "cannot reach" in query_lower:
            cname_records = [r for r in records if r["record_type"] == "CNAME"]
            apex_cname = [r for r in cname_records if r["record_name"] in {"@", domain_name}]

            causes = [
                "CNAME record pointing to an unreachable or non-existent canonical target.",
                "RFC 1034 CNAME collision: A CNAME record cannot coexist with any other record type on the same label.",
                "CNAME at apex/zone apex: standard DNS specification prohibits CNAME at zone apex (@).",
            ]
            if apex_cname:
                causes.insert(0, f"Apex CNAME detected on '{apex_cname[0]['record_name']}', which violates RFC 1034.")

            actions = [
                "Verify the target hostname of your CNAME record resolves to valid IP addresses.",
                "Do not place a CNAME record at the zone apex (@); use an 'A' record or Route 53 ALIAS instead.",
                "Check that no other record (TXT, MX, etc.) shares the exact same label as your CNAME record.",
            ]

            return TroubleshootResponse(
                problem=f"CNAME Alias Resolution Misconfiguration for {domain_name}",
                possible_causes=causes,
                analysis=(
                    f"Under RFC 1034 Section 3.6.2, if a CNAME record is present at a node, no other data may exist "
                    f"for that node. Zone '{domain_name}' currently contains {len(cname_records)} CNAME record(s). "
                    "Ensure canonical targets end with a fully qualified domain name and resolve correctly."
                ),
                recommended_actions=actions,
                severity=SeverityLevel.MEDIUM,
                requires_manual_verification=True,
            )

        # Issue 3: Mail / MX record issues
        if "mx" in query_lower or "mail" in query_lower or "email" in query_lower or "spf" in query_lower:
            mx_records = [r for r in records if r["record_type"] == "MX"]
            txt_records = [r for r in records if r["record_type"] == "TXT"]
            spf_records = [r for r in txt_records if "v=spf1" in r["value"]]

            causes = [
                "Missing or incorrectly prioritized MX records for mail routing.",
                "MX record pointing to an IP address instead of an FQDN mail exchanger hostname (RFC 2181 violation).",
                "Missing SPF (v=spf1) or DKIM TXT authentication records resulting in spam rejection.",
            ]
            actions = [
                "Ensure at least one MX record exists with an integer priority (e.g. 10) and valid mail server hostname.",
                "Do not enter an IP address as the MX record value; create an 'A' record first and reference its hostname.",
                "Configure a TXT record with SPF validation (e.g., 'v=spf1 include:_spf.google.com ~all') to avoid delivery rejection.",
            ]

            severity = SeverityLevel.MEDIUM if mx_records else SeverityLevel.HIGH

            return TroubleshootResponse(
                problem=f"Email Exchange (MX) and Delivery Configuration Issue for {domain_name}",
                possible_causes=causes,
                analysis=(
                    f"Zone '{domain_name}' contains {len(mx_records)} MX record(s) and {len(spf_records)} SPF record(s). "
                    "Mail Transfer Agents (MTAs) require MX records pointing to valid hostnames with priority weighting. "
                    "Absence of valid MX records prevents inbound mail delivery, while absence of SPF/DKIM causes outbound messages to bounce."
                ),
                recommended_actions=actions,
                severity=severity,
                requires_manual_verification=True,
            )

        # Issue 4: Propagation and TTL issues
        if "propagat" in query_lower or "ttl" in query_lower or "delay" in query_lower or "cache" in query_lower:
            ttls = [r["ttl"] for r in records]
            max_ttl = max(ttls) if ttls else 300

            return TroubleshootResponse(
                problem=f"DNS Propagation and Resolver Cache Latency for {domain_name}",
                possible_causes=[
                    f"Recursive DNS resolvers cache previous record values according to the previous TTL ({max_ttl}s).",
                    "Negative response caching (SOA minimum TTL) cached an NXDOMAIN response temporarily.",
                    "Regional ISP DNS resolvers retaining stale cached records past TTL expiration.",
                ],
                analysis=(
                    f"DNS propagation is governed by TTL (Time-To-Live). When records are updated, intermediate "
                    f"resolvers will continue serving cached entries until their TTL expires (up to {max_ttl} seconds / {round(max_ttl / 60, 1)} minutes). "
                    "This is expected distributed DNS behavior, not a server fault."
                ),
                recommended_actions=[
                    f"Wait for the maximum TTL duration ({max_ttl} seconds) to elapse.",
                    "Flush local OS DNS cache using `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (macOS).",
                    "Test query against authoritative nameservers directly using `dig @8.8.8.8 " + domain_name + "` to bypass local ISP cache.",
                    "For future migrations, lower record TTL to 60 or 300 seconds 24 hours in advance.",
                ],
                severity=SeverityLevel.LOW,
                requires_manual_verification=True,
            )

        # Default General Diagnostic
        return TroubleshootResponse(
            problem=f"DNS Diagnostic Evaluation for {domain_name}",
            possible_causes=[
                "Discrepancy between requested DNS resource record and authoritative zone data.",
                "Upstream recursive resolver caching stale records.",
                "Incomplete zone configuration or missing record entry.",
            ],
            analysis=(
                f"Evaluated query: '{request.query}'. Zone '{domain_name}' currently manages {len(records)} "
                f"DNS record(s) across types {', '.join(sorted(record_types)) if record_types else 'none'}. "
                "Authoritative records in this zone appear structurally valid. Verify the specific record name requested."
            ),
            recommended_actions=[
                f"Inspect the DNS record table for hosted zone '{domain_name}' to confirm target records exist.",
                "Verify spelling of subdomain label and ensure no accidental trailing spaces exist.",
                "Test live resolution using standard CLI utilities: `nslookup <hostname>` or `dig <hostname>`.",
            ],
            severity=SeverityLevel.MEDIUM,
            requires_manual_verification=True,
        )
