import { apiRequest, apiUploadForm } from "../lib/api";
import type {
  CategoryImageUploadResponse,
  CategoryOptionResponse,
  CategoryResponse,
  UpsertCategoryRequest
} from "../types/categories";

export function listCategories(): Promise<CategoryResponse[]> {
  return apiRequest<CategoryResponse[]>("/api/v1/categories");
}

/** Options ativas — alias tambem em /books/category-options para BooksPage. */
export function listCategoryOptions(): Promise<CategoryOptionResponse[]> {
  return apiRequest<CategoryOptionResponse[]>("/api/v1/categories/options");
}

export function createCategory(payload: UpsertCategoryRequest): Promise<CategoryResponse> {
  return apiRequest<CategoryResponse>("/api/v1/categories", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateCategory(
  categoryId: number,
  payload: UpsertCategoryRequest
): Promise<CategoryResponse> {
  return apiRequest<CategoryResponse>(`/api/v1/categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteCategory(categoryId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/categories/${categoryId}`, {
    method: "DELETE"
  });
}

export function uploadCategoryImage(file: File): Promise<CategoryImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadForm<CategoryImageUploadResponse>("/api/v1/categories/upload/image", formData);
}
