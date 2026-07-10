export type PermissionResponse = {
  id: number;
  code: string;
  module: string;
  description: string;
};

export type RoleResponse = {
  id: number;
  schoolId: number | null;
  name: string;
  isSystem: boolean;
  status: string;
  permissionCodes: string[];
};

export type UpsertRoleRequest = {
  name: string;
  status: string;
  permissionCodes: string[];
};
