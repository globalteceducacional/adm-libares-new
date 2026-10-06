import { apiRequest } from "../lib/api";
import type { SiteCommentResponse } from "../types/siteComments";

export function listSiteComments(): Promise<SiteCommentResponse[]> {
  return apiRequest<SiteCommentResponse[]>("/api/v1/site-comments");
}

export function updateSiteCommentStatus(
  commentId: number,
  status: "0" | "1"
): Promise<SiteCommentResponse> {
  return apiRequest<SiteCommentResponse>(`/api/v1/site-comments/${commentId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export function deleteSiteComment(commentId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/site-comments/${commentId}`, {
    method: "DELETE"
  });
}
