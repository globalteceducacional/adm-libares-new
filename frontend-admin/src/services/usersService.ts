import { apiRequest } from "../lib/api";
import type { UpdateUserStatusRequest, UserResponse } from "../types/users";

export function listUsers(): Promise<UserResponse[]> {
  return apiRequest<UserResponse[]>("/api/v1/users");
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

export function deleteUser(userId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/users/${userId}`, {
    method: "DELETE"
  });
}
