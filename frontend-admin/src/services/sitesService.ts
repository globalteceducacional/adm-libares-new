import { apiRequest, apiUploadForm } from "../lib/api";
import type {
  SiteCoverUploadResponse,
  SiteFileUploadResponse,
  SiteResponse,
  UpsertSiteRequest
} from "../types/sites";

export function listSites(): Promise<SiteResponse[]> {
  return apiRequest<SiteResponse[]>("/api/v1/sites");
}

export function createSite(payload: UpsertSiteRequest): Promise<SiteResponse> {
  return apiRequest<SiteResponse>("/api/v1/sites", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateSite(siteId: number, payload: UpsertSiteRequest): Promise<SiteResponse> {
  return apiRequest<SiteResponse>(`/api/v1/sites/${siteId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteSite(siteId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/sites/${siteId}`, {
    method: "DELETE"
  });
}

export function uploadSiteCover(file: File): Promise<SiteCoverUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadForm<SiteCoverUploadResponse>("/api/v1/sites/upload/cover", formData);
}

export function uploadSiteFile(file: File): Promise<SiteFileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadForm<SiteFileUploadResponse>("/api/v1/sites/upload/file", formData);
}
