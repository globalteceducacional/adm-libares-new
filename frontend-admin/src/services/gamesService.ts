import { apiRequest, apiUploadForm } from "../lib/api";
import type { GameResponse, UpsertGameRequest } from "../types/games";
import type { BookCoverUploadResponse } from "../types/books";

export function listGames(): Promise<GameResponse[]> {
  return apiRequest<GameResponse[]>("/api/v1/games");
}

export function createGame(payload: UpsertGameRequest): Promise<GameResponse> {
  return apiRequest<GameResponse>("/api/v1/games", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateGame(id: number, payload: UpsertGameRequest): Promise<GameResponse> {
  return apiRequest<GameResponse>(`/api/v1/games/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteGame(id: number): Promise<void> {
  return apiRequest<void>(`/api/v1/games/${id}`, { method: "DELETE" });
}

export function uploadGameCover(file: File): Promise<BookCoverUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUploadForm<BookCoverUploadResponse>("/api/v1/games/upload/cover", formData);
}
