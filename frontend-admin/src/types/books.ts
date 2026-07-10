import type { AcervoOptionResponse } from "./acervos";

export type BookFileType = "server_url" | "local";

export type BookResponse = {
  id: number;
  title: string;
  authorId: number;
  authorName?: string | null;
  bookCoverImage?: string | null;
  status: string;
  description?: string | null;
  views?: number;
  featured?: boolean;
  fileType?: string | null;
  fileUrl?: string | null;
  rateAvg?: string | null;
  totalRate?: number;
  categoryId?: string | null;
  categoryIds?: number[];
  sectionIds?: number[];
  acervos?: AcervoOptionResponse[];
};

export type UpsertBookRequest = {
  title: string;
  authorId: number;
  status: string;
  acervoIds: number[];
  categoryIds: number[];
  description: string;
  bookCoverImage?: string | null;
  fileType: BookFileType;
  fileUrl?: string | null;
  sectionIds: number[];
  featured: boolean;
};

export type CategoryOptionResponse = {
  id: number;
  name: string;
};

export type HomeSectionOptionResponse = {
  id: number;
  title: string;
};

export type BookCoverUploadResponse = {
  filename: string;
};

export type BookFileUploadResponse = {
  filename: string;
  fileUrl: string;
};

export const EMPTY_BOOK_FORM: UpsertBookRequest = {
  title: "",
  authorId: 0,
  status: "1",
  acervoIds: [],
  categoryIds: [],
  description: "",
  bookCoverImage: null,
  fileType: "server_url",
  fileUrl: "",
  sectionIds: [],
  featured: false
};
