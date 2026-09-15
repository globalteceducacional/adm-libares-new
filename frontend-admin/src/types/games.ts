export type GameResponse = {
  id: number;
  catId: string;
  authorId: number;
  featured: number;
  title: string;
  description: string;
  coverImage: string;
  fileType: string;
  fileUrl: string;
  views: number;
  status: number;
};

export type UpsertGameRequest = {
  catId: string;
  authorId: number;
  featured: number;
  title: string;
  description: string;
  coverImage: string;
  fileType: string;
  fileUrl: string;
  status: number;
};

export const EMPTY_GAME_FORM: UpsertGameRequest = {
  catId: "",
  authorId: 0,
  featured: 0,
  title: "",
  description: "",
  coverImage: "",
  fileType: "ludo_educativo",
  fileUrl: "",
  status: 1
};
