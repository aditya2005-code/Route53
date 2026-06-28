export type RecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "TXT"
  | "MX"
  | "NS"
  | "PTR"
  | "SRV"
  | "CAA";

export interface DNSRecord {
  id: number;
  hosted_zone_id: number;
  record_name: string;
  record_type: RecordType;
  value: string;
  ttl: number;
  priority: number | null;
  created_at: string;
  updated_at: string;
}

export interface DNSRecordsPaginatedResponse {
  items: DNSRecord[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
