export type LoginRequest = {
  username: string;
  password: string;
};

export type AuthSchoolOption = {
  id: number;
  name: string;
};

export type LoginResponse = {
  accessToken: string;
  expiresInSeconds: number;
  tokenType?: string;
  isSuperAdmin?: boolean;
  schoolId?: number | null;
  permissions?: string[];
  allowedSchools?: AuthSchoolOption[];
  requiresSchoolContext?: boolean;
};

export type AuthMeResponse = {
  id: number;
  username: string;
  name: string;
  isSuperAdmin: boolean;
  schoolId: number | null;
  schoolName: string | null;
  permissions: string[];
  permVersion: number;
  allowedSchools: AuthSchoolOption[];
  requiresSchoolContext: boolean;
  effectiveSchoolId: number | null;
};

export type AuthSession = {
  user: AuthMeResponse;
  permissions: Set<string>;
  isSuperAdmin: boolean;
};
