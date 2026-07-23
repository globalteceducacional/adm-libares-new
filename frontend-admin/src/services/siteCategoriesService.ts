import { apiRequest, apiUploadForm } from "../lib/api";
import type {
  SiteCategoryImageUploadResponse,
  SiteCategoryResponse,
  UpsertSiteCategoryRequest
} from "../types/siteCategories";

export function listSiteCategories(): Promise<SiteCategoryResponse[]> {
  return apiRequest<SiteCategoryResponse[]>("/api/v1/site-categories");
}

export function createSiteCategory(
  payload: UpsertSiteCategoryRequest
): Promise<SiteCategoryResponse> {
  return apiRequest<SiteCategoryResponse>("/api/v1/site-categories", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateSiteCategory(
  categoryId: number,
  payload: UpsertSiteCategoryRequest
): Promise<SiteCategoryResponse> {
  return apiRequest<SiteCategoryResponse>(`/api/v1/site-categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteSiteCategory(categoryId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/site-categories/${categoryId}`, {
    method: "DELETE"
  });
}

export function uploadSiteCategoryImage(file: File): Promise<SiteCategoryImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadForm<SiteCategoryImageUploadResponse>(
    "/api/v1/site-categories/upload/image",
    formData
  );
}
