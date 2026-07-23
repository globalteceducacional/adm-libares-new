import { apiRequest } from "../lib/api";
import type { SiteCommentResponse } from "../types/siteComments";

export function listSiteComments(): Promise<SiteCommentResponse[]> {
  return apiRequest<SiteCommentResponse[]>("/api/v1/site-comments");
}

export function deleteSiteComment(commentId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/site-comments/${commentId}`, {
    method: "DELETE"
  });
}
