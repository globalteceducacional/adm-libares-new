import { apiRequest } from "../lib/api";
import type {
  HomeSectionOptionResponse,
  HomeSectionResponse,
  UpsertHomeSectionRequest
} from "../types/homeSections";

export function listHomeSections(): Promise<HomeSectionResponse[]> {
  return apiRequest<HomeSectionResponse[]>("/api/v1/home-sections");
}

/** Options ativas — alias tambem em /books/home-section-options para BooksPage. */
export function listHomeSectionOptionsFromSections(): Promise<HomeSectionOptionResponse[]> {
  return apiRequest<HomeSectionOptionResponse[]>("/api/v1/home-sections/options");
}

export function createHomeSection(payload: UpsertHomeSectionRequest): Promise<HomeSectionResponse> {
  return apiRequest<HomeSectionResponse>("/api/v1/home-sections", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateHomeSection(
  sectionId: number,
  payload: UpsertHomeSectionRequest
): Promise<HomeSectionResponse> {
  return apiRequest<HomeSectionResponse>(`/api/v1/home-sections/${sectionId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteHomeSection(sectionId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/home-sections/${sectionId}`, {
    method: "DELETE"
  });
}
