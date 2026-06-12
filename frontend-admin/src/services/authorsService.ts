import { apiRequest } from "../lib/api";
import type { AuthorOptionResponse } from "../types/authors";

export function listAuthorOptions(): Promise<AuthorOptionResponse[]> {
  return apiRequest<AuthorOptionResponse[]>("/api/v1/books/author-options");
}
