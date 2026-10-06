import { apiRequest } from "../lib/api";
import type { AuditLogResponse, AuditOverviewResponse, PageResponse } from "../types/audit";

export function getAuditOverview(): Promise<AuditOverviewResponse> {
  return apiRequest<AuditOverviewResponse>("/api/v1/audit/overview");
}

export function listAuditLogs(
  page: number,
  size: number
): Promise<PageResponse<AuditLogResponse>> {
  return apiRequest<PageResponse<AuditLogResponse>>(
    `/api/v1/audit/logs?page=${page}&size=${size}`
  );
}
