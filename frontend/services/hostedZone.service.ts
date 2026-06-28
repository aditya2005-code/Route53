import client from "../lib/axios";
import { HostedZone, HostedZonesPaginatedResponse } from "../types/hostedZone";

export const hostedZoneService = {
  /**
   * Fetches paginated and optionally filtered hosted zones owned by the authenticated user.
   */
  async getHostedZones(
    search?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<HostedZonesPaginatedResponse> {
    const response = await client.get<HostedZonesPaginatedResponse>("/hosted-zones/", {
      params: {
        search: search || undefined,
        page,
        limit,
      },
    });
    return response.data;
  },

  /**
   * Creates a new hosted zone for a domain.
   */
  async createHostedZone(
    domainName: string,
    description?: string
  ): Promise<HostedZone> {
    const response = await client.post<HostedZone>("/hosted-zones/", {
      domain_name: domainName,
      description: description || null,
    });
    return response.data;
  },

  /**
   * Updates an existing hosted zone domain name or description.
   */
  async updateHostedZone(
    zoneId: number,
    domainName?: string,
    description?: string
  ): Promise<HostedZone> {
    const response = await client.put<HostedZone>(`/hosted-zones/${zoneId}`, {
      domain_name: domainName || undefined,
      description: description !== undefined ? description : undefined,
    });
    return response.data;
  },

  /**
   * Deletes a hosted zone by ID.
   */
  async deleteHostedZone(zoneId: number): Promise<void> {
    await client.delete(`/hosted-zones/${zoneId}`);
  },

  /**
   * Fetches metadata for a single hosted zone.
   */
  async getHostedZone(zoneId: number): Promise<HostedZone> {
    const response = await client.get<HostedZone>(`/hosted-zones/${zoneId}`);
    return response.data;
  },
};

export default hostedZoneService;
