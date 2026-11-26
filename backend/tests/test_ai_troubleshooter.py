from unittest.mock import patch, MagicMock
from fastapi import status


def test_troubleshoot_fallback_nxdomain(client, headers_a):
    # Create zone without @ or www records
    zone = client.post(
        "/hosted-zones/",
        json={"domain_name": "nxdomain-test.com", "description": "NXDOMAIN test"},
        headers=headers_a
    ).json()

    resp = client.post(
        "/ai/troubleshoot",
        json={
            "query": "My website is returning NXDOMAIN and not resolving",
            "zone_id": zone["id"]
        },
        headers=headers_a
    )
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert "NXDOMAIN" in data["problem"] or "Resolution" in data["problem"]
    assert len(data["possible_causes"]) > 0
    assert len(data["recommended_actions"]) > 0
    assert data["severity"] in ["low", "medium", "high"]
    assert data["requires_manual_verification"] is True
    assert data["zone_context"]["zone_id"] == zone["id"]


def test_troubleshoot_fallback_cname(client, headers_a):
    zone = client.post(
        "/hosted-zones/",
        json={"domain_name": "cname-test.com", "description": "CNAME test"},
        headers=headers_a
    ).json()

    resp = client.post(
        "/ai/troubleshoot",
        json={
            "query": "My CNAME record is not resolving to the canonical hostname",
            "zone_id": zone["id"]
        },
        headers=headers_a
    )
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert "CNAME" in data["problem"]
    assert data["requires_manual_verification"] is True


def test_troubleshoot_fallback_mail_mx(client, headers_a):
    zone = client.post(
        "/hosted-zones/",
        json={"domain_name": "mail-test.com", "description": "Mail test"},
        headers=headers_a
    ).json()

    resp = client.post(
        "/ai/troubleshoot",
        json={
            "query": "My MX records are not receiving inbound emails",
            "zone_id": zone["id"]
        },
        headers=headers_a
    )
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert "MX" in data["problem"] or "Mail" in data["problem"] or "Email" in data["problem"]


def test_troubleshoot_unauthorized_zone(client, headers_a, headers_b):
    # User A creates a zone
    zone_a = client.post(
        "/hosted-zones/",
        json={"domain_name": "private-zone-a.com", "description": "Zone A"},
        headers=headers_a
    ).json()

    # User B attempts to troubleshoot User A's zone -> must return 404
    resp = client.post(
        "/ai/troubleshoot",
        json={
            "query": "Why is this domain not working?",
            "zone_id": zone_a["id"]
        },
        headers=headers_b
    )
    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_troubleshoot_mocked_openai_success(client, headers_a, monkeypatch):
    zone = client.post(
        "/hosted-zones/",
        json={"domain_name": "openai-mock-zone.com", "description": "Mock zone"},
        headers=headers_a
    ).json()

    # Set fake API key
    from app.core.config import settings
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "sk-mock-test-key")

    from app.schemas.troubleshoot import TroubleshootResponse, SeverityLevel
    from app.services.troubleshoot_service import TroubleshootService

    mock_result = TroubleshootResponse(
        problem="Verified DNS Delegation Mismatch",
        possible_causes=["Glued NS records expired", "Registrar nameserver mismatch"],
        analysis="Authoritative nameservers in Route 53 do not match WHOIS registry records.",
        recommended_actions=["Update registrar NS records with Route 53 delegated set"],
        severity=SeverityLevel.HIGH,
        requires_manual_verification=True
    )

    with patch.object(TroubleshootService, "_call_openai", return_value=mock_result):
        resp = client.post(
            "/ai/troubleshoot",
            json={
                "query": "My nameservers are not propagating",
                "zone_id": zone["id"]
            },
            headers=headers_a
        )
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert data["problem"] == "Verified DNS Delegation Mismatch"
        assert data["severity"] == "high"
        assert data["requires_manual_verification"] is True
