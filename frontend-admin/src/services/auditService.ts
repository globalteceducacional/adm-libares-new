import { apiRequest } from "../lib/api";
import type { AuditOverviewResponse } from "../types/audit";

export function getAuditOverview(): Promise<AuditOverviewResponse> {
  return apiRequest<AuditOverviewResponse>("/api/v1/audit/overview");
}
