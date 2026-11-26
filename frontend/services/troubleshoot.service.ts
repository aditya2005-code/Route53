import client from "../lib/axios";
import { TroubleshootRequest, TroubleshootResponse } from "../types/troubleshoot";

export const troubleshootService = {
  async diagnose(payload: TroubleshootRequest): Promise<TroubleshootResponse> {
    const response = await client.post<TroubleshootResponse>("/ai/troubleshoot", payload);
    return response.data;
  },
};

export default troubleshootService;

