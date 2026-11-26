import client from "../lib/axios";
import { DashboardSummary } from "../types/dashboard";

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await client.get<DashboardSummary>("/dashboard/summary");
    return response.data;
  },
};

export default dashboardService;

