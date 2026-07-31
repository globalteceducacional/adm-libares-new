import { apiRequest } from "../lib/api";
import type { SchoolResponse, UpsertSchoolRequest } from "../types/schools";

export function listSchools(): Promise<SchoolResponse[]> {
  return apiRequest<SchoolResponse[]>("/api/v1/schools");
}

export function createSchool(payload: UpsertSchoolRequest): Promise<SchoolResponse> {
  return apiRequest<SchoolResponse>("/api/v1/schools", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateSchool(schoolId: number, payload: UpsertSchoolRequest): Promise<SchoolResponse> {
  return apiRequest<SchoolResponse>(`/api/v1/schools/${schoolId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteSchool(schoolId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/schools/${schoolId}`, {
    method: "DELETE"
  });
}
