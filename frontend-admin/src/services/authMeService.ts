import { apiRequest } from "../lib/api";
import type { AuthMeResponse } from "../types/auth";

export function fetchAuthMe(): Promise<AuthMeResponse> {
  return apiRequest<AuthMeResponse>("/api/v1/auth/me");
}
