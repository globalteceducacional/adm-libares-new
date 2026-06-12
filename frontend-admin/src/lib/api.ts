import { clearToken, getToken } from "./auth";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  disableUnauthorizedRedirect?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error(
      "Nao foi possivel contactar o servidor. Verifique se o backend esta ativo em http://localhost:8080."
    );
  }

  if (!response.ok) {
    // Apenas 401 representa sessao invalida/expirada. 403 e 500 sao erros do endpoint
    // (ex.: dados indisponiveis) e NAO devem deslogar o usuario.
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
