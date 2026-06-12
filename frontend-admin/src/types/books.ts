export type BookResponse = {
  id: number;
  title: string;
  authorId: number;
  authorName?: string | null;
  bookCoverImage?: string | null;
  status: string;
};

export type UpsertBookRequest = {
  title: string;
  authorId: number;
  status: string;
};
