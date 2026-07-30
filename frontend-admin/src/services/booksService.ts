import { apiRequest, apiUploadForm } from "../lib/api";
import type {
  BookCoverUploadResponse,
  BookFileUploadResponse,
  BookResponse,
  CategoryOptionResponse,
  HomeSectionOptionResponse,
  UpsertBookRequest
} from "../types/books";

export function listBooks(acervoId?: number): Promise<BookResponse[]> {
  const query = acervoId ? `?acervoId=${acervoId}` : "";
  return apiRequest<BookResponse[]>(`/api/v1/books${query}`);
}

export function listCategoryOptions(): Promise<CategoryOptionResponse[]> {
  return apiRequest<CategoryOptionResponse[]>("/api/v1/books/category-options");
}

export function listHomeSectionOptions(): Promise<HomeSectionOptionResponse[]> {
  return apiRequest<HomeSectionOptionResponse[]>("/api/v1/books/home-section-options");
}

export function uploadBookCover(file: File): Promise<BookCoverUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadForm<BookCoverUploadResponse>("/api/v1/books/upload/cover", formData);
}

export function uploadBookFile(file: File): Promise<BookFileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadForm<BookFileUploadResponse>("/api/v1/books/upload/file", formData);
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

export function toggleBookStatus(bookId: number, status: "0" | "1"): Promise<BookResponse> {
  return apiRequest<BookResponse>(`/api/v1/books/${bookId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export function deleteBook(bookId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/books/${bookId}`, {
    method: "DELETE"
  });
}
