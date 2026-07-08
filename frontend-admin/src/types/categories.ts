export type CategoryOptionResponse = {
  id: number;
  name: string;
};

export type CategoryResponse = {
  id: number;
  name: string;
  image?: string | null;
  status: string;
};

export type UpsertCategoryRequest = {
  name: string;
  image?: string;
  status: string;
};

export type CategoryImageUploadResponse = {
  filename: string;
};
