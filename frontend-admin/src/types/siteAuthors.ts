export type SiteAuthorResponse = {
  id: number;
  name: string;
  image: string;
  description?: string | null;
  status: string;
};

export type UpsertSiteAuthorRequest = {
  name: string;
  image?: string;
  description?: string;
  status: string;
};

export type SiteAuthorImageUploadResponse = {
  filename: string;
};
