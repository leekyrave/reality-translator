export const BASE_URL = "http://localhost:5000/api";

async function request<T>(
  endpoint: string,
  method: string = "GET",
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `Error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

async function requestForm<T>(endpoint: string, formData: FormData): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
    credentials: "include",
    // No Content-Type header — browser sets multipart/form-data with boundary
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `Error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, "GET"),
  post: <T>(endpoint: string, body: unknown) => request<T>(endpoint, "POST", body),
  postForm: <T>(endpoint: string, formData: FormData) => requestForm<T>(endpoint, formData),
};
