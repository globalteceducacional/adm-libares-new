export type HomeSectionOptionResponse = {
  id: number;
  title: string;
};

export type HomeSectionResponse = {
  id: number;
  title: string;
  bookIds: number[];
  bookCount: number;
  status: string;
};

export type UpsertHomeSectionRequest = {
  title: string;
  bookIds: number[];
  status: string;
};
