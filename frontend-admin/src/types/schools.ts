export type SchoolResponse = {
  id: number;
  name: string;
  slug: string;
  status: string;
};

export type UpsertSchoolRequest = {
  name: string;
  slug?: string;
  status: string;
};

export type CreateSchoolAdminRequest = {
  username: string;
  password: string;
  name: string;
};

export type SchoolAdminResponse = {
  id: number;
  username: string;
  name: string;
  schoolId: number;
  status: string;
};
