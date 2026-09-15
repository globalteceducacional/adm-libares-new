import { apiRequest, apiUploadForm } from "../lib/api";
import type { AuthMeResponse } from "../types/auth";

export function fetchAuthMe(): Promise<AuthMeResponse> {
  return apiRequest<AuthMeResponse>("/api/v1/auth/me");
}

export function updateAuthProfile(payload: { name?: string; uiTheme?: string }): Promise<AuthMeResponse> {
  return apiRequest<AuthMeResponse>("/api/v1/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function uploadAuthAvatar(file: File): Promise<AuthMeResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadForm<AuthMeResponse>("/api/v1/auth/me/avatar", formData);
}
