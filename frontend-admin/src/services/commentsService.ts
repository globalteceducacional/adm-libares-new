import { apiRequest } from "../lib/api";
import type { CommentResponse, UpdateCommentStatusRequest } from "../types/comments";

export function listComments(): Promise<CommentResponse[]> {
  return apiRequest<CommentResponse[]>("/api/v1/comments");
}

export function updateCommentStatus(
  commentId: number,
  payload: UpdateCommentStatusRequest
): Promise<CommentResponse> {
  return apiRequest<CommentResponse>(`/api/v1/comments/${commentId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteComment(commentId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/comments/${commentId}`, {
    method: "DELETE"
  });
}
