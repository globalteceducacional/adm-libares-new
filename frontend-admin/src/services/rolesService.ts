import { apiRequest } from "../lib/api";
import type { PermissionResponse, RoleResponse, UpsertRoleRequest } from "../types/roles";

export function listRoles(): Promise<RoleResponse[]> {
  return apiRequest<RoleResponse[]>("/api/v1/roles");
}

export function listPermissions(): Promise<PermissionResponse[]> {
  return apiRequest<PermissionResponse[]>("/api/v1/roles/permissions");
}

export function createRole(payload: UpsertRoleRequest): Promise<RoleResponse> {
  return apiRequest<RoleResponse>("/api/v1/roles", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateRole(roleId: number, payload: UpsertRoleRequest): Promise<RoleResponse> {
  return apiRequest<RoleResponse>(`/api/v1/roles/${roleId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteRole(roleId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/roles/${roleId}`, {
    method: "DELETE"
  });
}
