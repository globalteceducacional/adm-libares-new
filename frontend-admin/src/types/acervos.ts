export type AcervoOptionResponse = {
  id: number;
  name: string;
};

export type AcervoResponse = {
  id: number;
  name: string;
  description?: string | null;
  status: string;
  bookCount: number;
  userCount: number;
};

export type UpsertAcervoRequest = {
  name: string;
  description?: string;
  status: string;
};
