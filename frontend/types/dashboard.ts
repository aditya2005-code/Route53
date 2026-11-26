import { HostedZone } from "./hostedZone";
import { DNSRecord } from "./dnsRecord";

export interface DashboardSummary {
  total_zones: number;
  total_records: number;
  record_distribution: Record<string, number>;
  recent_zones: HostedZone[];
  recent_records: DNSRecord[];
}

