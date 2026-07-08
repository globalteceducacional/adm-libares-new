export type AuthorOptionResponse = {
  id: number;
  name: string;
  image?: string | null;
};

export type AuthorResponse = {
  id: number;
  name: string;
  image?: string | null;
  description?: string | null;
  status: string;
};

export type UpsertAuthorRequest = {
  name: string;
  image?: string;
  description?: string;
  status: string;
};

export type AuthorImageUploadResponse = {
  filename: string;
};
