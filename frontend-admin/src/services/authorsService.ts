import { apiRequest, apiUploadForm } from "../lib/api";
import type {
  AuthorImageUploadResponse,
  AuthorOptionResponse,
  AuthorResponse,
  UpsertAuthorRequest
} from "../types/authors";

export function listAuthors(): Promise<AuthorResponse[]> {
  return apiRequest<AuthorResponse[]>("/api/v1/authors");
}

/** Options for BooksPage badges/select — active authors only. */
export function listAuthorOptions(): Promise<AuthorOptionResponse[]> {
  return apiRequest<AuthorOptionResponse[]>("/api/v1/books/author-options");
}

export function createAuthor(payload: UpsertAuthorRequest): Promise<AuthorResponse> {
  return apiRequest<AuthorResponse>("/api/v1/authors", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAuthor(authorId: number, payload: UpsertAuthorRequest): Promise<AuthorResponse> {
  return apiRequest<AuthorResponse>(`/api/v1/authors/${authorId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteAuthor(authorId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/authors/${authorId}`, {
    method: "DELETE"
  });
}

export function uploadAuthorImage(file: File): Promise<AuthorImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadForm<AuthorImageUploadResponse>("/api/v1/authors/upload/image", formData);
}
