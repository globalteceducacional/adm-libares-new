import { clearToken, getSchoolContextId, getToken } from "./auth";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  disableUnauthorizedRedirect?: boolean;
};

function buildHeaders(options: RequestOptions): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const schoolContextId = getSchoolContextId();
  if (schoolContextId != null) {
    headers["X-School-Context"] = String(schoolContextId);
  }

  return headers;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: buildHeaders(options)
    });
  } catch {
    throw new Error(
      "Nao foi possivel contactar o servidor. Verifique se o backend esta ativo em http://localhost:8080."
    );
  }

  if (!response.ok) {
    if (response.status === 401 && !options.disableUnauthorizedRedirect) {
      clearToken();
      window.location.href = "/login";
      throw new Error("Sessao invalida ou expirada. Faca login novamente.");
    }

    let message = "Erro ao processar requisicao";
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // Mantem mensagem padrao caso o corpo nao seja JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiUploadForm<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const schoolContextId = getSchoolContextId();
  if (schoolContextId != null) {
    headers["X-School-Context"] = String(schoolContextId);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData
    });
  } catch {
    throw new Error(
      "Nao foi possivel contactar o servidor. Verifique se o backend esta ativo em http://localhost:8080."
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      window.location.href = "/login";
      throw new Error("Sessao invalida ou expirada. Faca login novamente.");
    }

    let message = "Erro ao enviar arquivo";
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // Mantem mensagem padrao.
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}
