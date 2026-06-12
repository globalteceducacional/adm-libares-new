export type CommentResponse = {
  id: number;
  bookId: number;
  bookTitle?: string | null;
  userId?: number | null;
  userName?: string | null;
  commentText: string;
  status: string;
  commentOn?: string | null;
};

export type UpdateCommentStatusRequest = {
  status: string;
};
