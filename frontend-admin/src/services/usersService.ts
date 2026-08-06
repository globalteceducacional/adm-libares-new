import { apiRequest } from "../lib/api";
import type {
  CreateUserRequest,
  UpdateUserAcervoRequest,
  UpdateUserProfileRequest,
  UpdateUserStatusRequest,
  UserResponse
} from "../types/users";

export function listUsers(acervoId?: number): Promise<UserResponse[]> {
  const query = acervoId ? `?acervoId=${acervoId}` : "";
  return apiRequest<UserResponse[]>(`/api/v1/users${query}`);
}

export function createUser(payload: CreateUserRequest): Promise<UserResponse> {
  return apiRequest<UserResponse>("/api/v1/users", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateUserProfile(
  userId: number,
  payload: UpdateUserProfileRequest
): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/api/v1/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function updateUserStatus(
  userId: number,
  payload: UpdateUserStatusRequest
): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/api/v1/users/${userId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function updateUserAcervo(
  userId: number,
  payload: UpdateUserAcervoRequest
): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/api/v1/users/${userId}/acervo`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteUser(userId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/users/${userId}`, {
    method: "DELETE"
  });
}
