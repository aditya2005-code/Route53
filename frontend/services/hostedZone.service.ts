import client from "../lib/axios";
import { HostedZonesPaginatedResponse } from "../types/hostedZone";

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
};

export default hostedZoneService;
