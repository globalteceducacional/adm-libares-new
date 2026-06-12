import { apiRequest } from "../lib/api";
import type { BookResponse, UpsertBookRequest } from "../types/books";

export function listBooks(): Promise<BookResponse[]> {
  return apiRequest<BookResponse[]>("/api/v1/books");
}

export function createBook(payload: UpsertBookRequest): Promise<BookResponse> {
  return apiRequest<BookResponse>("/api/v1/books", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateBook(bookId: number, payload: UpsertBookRequest): Promise<BookResponse> {
  return apiRequest<BookResponse>(`/api/v1/books/${bookId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteBook(bookId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/books/${bookId}`, {
    method: "DELETE"
  });
}
