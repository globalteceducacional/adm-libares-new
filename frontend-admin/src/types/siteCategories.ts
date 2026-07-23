export type SiteCategoryResponse = {
  id: number;
  name: string;
  image: string;
  status: string;
};

export type UpsertSiteCategoryRequest = {
  name: string;
  image?: string;
  status: string;
};

export type SiteCategoryImageUploadResponse = {
  filename: string;
};
