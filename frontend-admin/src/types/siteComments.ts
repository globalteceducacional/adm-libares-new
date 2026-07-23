export type SiteCommentResponse = {
  id: number;
  /** Sites.id (coluna legada book_id). */
  siteId: number;
  /** Alias de siteId — coluna fisica book_id. */
  bookId: number;
  userId: number;
  userName: string;
  userEmail: string;
  userImage: string;
  userType: string;
  commentText: string;
  dtRate?: string | null;
  commentOn: string;
};
