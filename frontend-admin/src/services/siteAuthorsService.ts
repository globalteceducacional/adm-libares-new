import { apiRequest, apiUploadForm } from "../lib/api";
import type {
  SiteAuthorImageUploadResponse,
  SiteAuthorResponse,
  UpsertSiteAuthorRequest
} from "../types/siteAuthors";

export function listSiteAuthors(): Promise<SiteAuthorResponse[]> {
  return apiRequest<SiteAuthorResponse[]>("/api/v1/site-authors");
}

export function createSiteAuthor(payload: UpsertSiteAuthorRequest): Promise<SiteAuthorResponse> {
  return apiRequest<SiteAuthorResponse>("/api/v1/site-authors", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateSiteAuthor(
  authorId: number,
  payload: UpsertSiteAuthorRequest
): Promise<SiteAuthorResponse> {
  return apiRequest<SiteAuthorResponse>(`/api/v1/site-authors/${authorId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteSiteAuthor(authorId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/site-authors/${authorId}`, {
    method: "DELETE"
  });
}

export function uploadSiteAuthorImage(file: File): Promise<SiteAuthorImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadForm<SiteAuthorImageUploadResponse>("/api/v1/site-authors/upload/image", formData);
}
