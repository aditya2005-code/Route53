import client from "../lib/axios";
import { DNSRecord, DNSRecordsPaginatedResponse } from "../types/dnsRecord";

export const dnsRecordService = {
  /**
   * Fetches paginated, filtered, and searched DNS records for a given hosted zone.
   */
  async getDNSRecords(
    zoneId: number,
    search?: string,
    type?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<DNSRecordsPaginatedResponse> {
    const response = await client.get<DNSRecordsPaginatedResponse>(
      `/hosted-zones/${zoneId}/records`,
      {
        params: {
          search: search || undefined,
          type: type || undefined,
          page,
          limit,
        },
      }
    );
    return response.data;
  },

  /**
   * Creates a new DNS record under a hosted zone.
   */
  async createDNSRecord(
    zoneId: number,
    data: {
      record_name: string;
      record_type: string;
      value: string;
      ttl: number;
      priority?: number | null;
    }
  ): Promise<DNSRecord> {
    const response = await client.post<DNSRecord>(
      `/hosted-zones/${zoneId}/records`,
      data
    );
    return response.data;
  },

  /**
   * Updates an existing DNS record under a hosted zone.
   */
  async updateDNSRecord(
    zoneId: number,
    recordId: number,
    data: {
      record_name?: string;
      record_type?: string;
      value?: string;
      ttl?: number;
      priority?: number | null;
    }
  ): Promise<DNSRecord> {
    const response = await client.put<DNSRecord>(
      `/hosted-zones/${zoneId}/records/${recordId}`,
      data
    );
    return response.data;
  },

  /**
   * Deletes a DNS record by ID.
   */
  async deleteDNSRecord(zoneId: number, recordId: number): Promise<void> {
    await client.delete(`/hosted-zones/${zoneId}/records/${recordId}`);
  },
};

export default dnsRecordService;
