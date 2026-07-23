export type SiteFileType = "server_url" | "local";

export type SiteResponse = {
  id: number;
  categoryIds: number[];
  authorId: number;
  title: string;
  description: string;
  coverImage: string;
  fileType: string;
  fileUrl: string;
  featured: string;
  status: string;
  totalRate?: number;
  rateAvg?: string;
  views?: number;
};

export type UpsertSiteRequest = {
  categoryIds: number[];
  authorId: number;
  title: string;
  description: string;
  coverImage?: string | null;
  fileType: SiteFileType;
  fileUrl?: string | null;
  featured: string;
  status: string;
};

export type SiteCoverUploadResponse = {
  filename: string;
};

export type SiteFileUploadResponse = {
  filename: string;
  fileUrl: string;
};

export const EMPTY_SITE_FORM: UpsertSiteRequest = {
  categoryIds: [],
  authorId: 0,
  title: "",
  description: "",
  coverImage: null,
  fileType: "server_url",
  fileUrl: "",
  featured: "0",
  status: "1"
};
