export type SiteSectionResponse = {
  id: number;
  title: string;
  siteIds: number[];
  siteCount: number;
  status: string;
};

export type UpsertSiteSectionRequest = {
  title: string;
  siteIds: number[];
  status: string;
};
