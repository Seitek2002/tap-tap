import { API_BASE_URL } from "./config";
import { ApiError } from "./error";
import { tokenStorage } from "./token-storage";

// Вызывается при 401 от сервера (протухший/невалидный токен) — сессия
// подписывается на это в entities/session, чтобы самой себя не импортировать
// сюда и не ловить циклическую зависимость shared → entities.
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | null | Record<string, unknown>;
};

async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;
  const isPlainBody =
    body !== null && typeof body === "object" && !(body instanceof FormData);

  const token = tokenStorage.get()?.token;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    body: isPlainBody
      ? JSON.stringify(body)
      : (body as BodyInit | null | undefined),
    headers: {
      ...(isPlainBody ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (res.status === 401) {
    onUnauthorized?.();
  }

  if (!res.ok) {
    const message = await res
      .json()
      .then((data: { error?: string }) => data.error)
      .catch(() => undefined);
    throw new ApiError(res.status, message ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  delete: <T>(path: string, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
  get: <T>(path: string, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(
    path: string,
    body?: ApiFetchOptions["body"],
    options?: ApiFetchOptions,
  ) => apiFetch<T>(path, { ...options, body, method: "POST" }),
  put: <T>(
    path: string,
    body?: ApiFetchOptions["body"],
    options?: ApiFetchOptions,
  ) => apiFetch<T>(path, { ...options, body, method: "PUT" }),
};
