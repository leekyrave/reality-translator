const BASE_URL = "http://localhost:3000/api"; // url api

// just a request wrapper to handle auth and errors in one place
async function request<T>(
  endpoint: string,
  method: string = "GET",
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include", // cookie automatically sent with requests
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `Error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, "GET"),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, "POST", body),
};
