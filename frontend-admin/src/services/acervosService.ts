import { apiRequest } from "../lib/api";
import type {
  AcervoOptionResponse,
  AcervoResponse,
  SyncAcervoBooksRequest,
  UpsertAcervoRequest
} from "../types/acervos";

export function listAcervos(): Promise<AcervoResponse[]> {
  return apiRequest<AcervoResponse[]>("/api/v1/acervos");
}

export function getAcervo(acervoId: number): Promise<AcervoResponse> {
  return apiRequest<AcervoResponse>(`/api/v1/acervos/${acervoId}`);
}

export function syncAcervoBooks(
  acervoId: number,
  payload: SyncAcervoBooksRequest
): Promise<AcervoResponse> {
  return apiRequest<AcervoResponse>(`/api/v1/acervos/${acervoId}/books`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function listAcervoOptions(): Promise<AcervoOptionResponse[]> {
  return apiRequest<AcervoOptionResponse[]>("/api/v1/acervos/options");
}

export function createAcervo(payload: UpsertAcervoRequest): Promise<AcervoResponse> {
  return apiRequest<AcervoResponse>("/api/v1/acervos", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAcervo(acervoId: number, payload: UpsertAcervoRequest): Promise<AcervoResponse> {
  return apiRequest<AcervoResponse>(`/api/v1/acervos/${acervoId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteAcervo(acervoId: number): Promise<void> {
  return apiRequest<void>(`/api/v1/acervos/${acervoId}`, {
    method: "DELETE"
  });
}
