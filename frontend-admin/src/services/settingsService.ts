import { apiRequest } from "../lib/api";
import type { SettingsResponse, UpdateSettingsRequest } from "../types/settings";

export function getSettings(): Promise<SettingsResponse> {
  return apiRequest<SettingsResponse>("/api/v1/settings");
}

export function updateSettings(payload: UpdateSettingsRequest): Promise<SettingsResponse> {
  return apiRequest<SettingsResponse>("/api/v1/settings", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
