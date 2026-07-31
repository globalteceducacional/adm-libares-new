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
