import { apiRequest } from "../lib/api";
import type { CreateTeamMemberRequest, TeamMemberResponse } from "../types/team";

export function listTeamMembers(): Promise<TeamMemberResponse[]> {
  return apiRequest<TeamMemberResponse[]>("/api/v1/admin-users");
}

export function createTeamMember(payload: CreateTeamMemberRequest): Promise<TeamMemberResponse> {
  return apiRequest<TeamMemberResponse>("/api/v1/admin-users", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
