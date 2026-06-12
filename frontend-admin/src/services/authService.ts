import { apiRequest } from "../lib/api";
import type { LoginRequest, LoginResponse } from "../types/auth";

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    disableUnauthorizedRedirect: true
  });
}
