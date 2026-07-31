export type TeamRoleCode = "SCHOOL_ADMIN" | "PROFESSOR";

export type TeamMemberResponse = {
  id: number;
  username: string;
  name: string;
  schoolId: number;
  schoolName: string | null;
  roleCode: string;
  status: string;
};

export type CreateTeamMemberRequest = {
  username: string;
  password: string;
  name: string;
  schoolId: number;
  roleCode: TeamRoleCode;
};
