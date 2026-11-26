export type Severity = "low" | "medium" | "high";

export interface TroubleshootRequest {
  query: string;
  zone_id?: number | null;
  record_name?: string | null;
  record_type?: string | null;
}

export interface TroubleshootResponse {
  problem: string;
  possible_causes: string[];
  analysis: string;
  recommended_actions: string[];
  severity: Severity;
  requires_manual_verification: boolean;
  zone_context?: {
    zone_id: number;
    domain_name: string;
    description?: string;
    total_records: number;
    records: Array<{
      id: number;
      record_name: string;
      record_type: string;
      value: string;
      ttl: number;
      priority?: number;
    }>;
  };
}

