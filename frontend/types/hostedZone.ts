export interface HostedZone {
  id: number;
  user_id: number;
  domain_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  record_count?: number;
}

export interface HostedZonesPaginatedResponse {
  items: HostedZone[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
