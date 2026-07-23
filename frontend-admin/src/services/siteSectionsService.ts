import { apiRequest } from "../lib/api";
import type { SiteSectionResponse, UpsertSiteSectionRequest } from "../types/siteSections";

export function listSiteSections(): Promise<SiteSectionResponse[]> {
  return apiRequest<SiteSectionResponse[]>("/api/v1/site-sections");
}

export function createSiteSection(payload: UpsertSiteSectionRequest): Promise<SiteSectionResponse> {
  return apiRequest<SiteSectionResponse>("/api/v1/site-sections", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateSiteSection(
  sectionId: number,
  payload: UpsertSiteSectionRequest
): Promise<SiteSectionResponse> {
  return apiRequest<SiteSectionResponse>(`/api/v1/site-sections/${sectionId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteSiteSection(sectionId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/site-sections/${sectionId}`, {
    method: "DELETE"
  });
}
