import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import type { ApiError } from "../types/types";

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

const TOKEN_KEY   = "access_token";
const REFRESH_KEY = "refresh_token";

// ─── Token helpers ────────────────────────────────────────────────────────────

export const tokenStorage = {
  getAccess:    ()        => localStorage.getItem(TOKEN_KEY),
  getRefresh:   ()        => localStorage.getItem(REFRESH_KEY),
  setAccess:    (t: string) => localStorage.setItem(TOKEN_KEY, t),
  setRefresh:   (t: string) => localStorage.setItem(REFRESH_KEY, t),
  clearAll:     ()        => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ─── Axios instance ───────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → refresh or logout
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (err: unknown, token: string | null) => {
  pendingQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
  pendingQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refresh = tokenStorage.getRefresh();
        if (!refresh) throw new Error("No refresh token");

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh });
        tokenStorage.setAccess(data.accessToken);
        processQueue(null, data.accessToken);
        return api(original);
      } catch (err) {
        processQueue(err, null);
        tokenStorage.clearAll();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Generic error extractor ──────────────────────────────────────────────────

export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message ?? error.message,
      status: error.response?.status ?? 0,
      errors: error.response?.data?.errors,
    };
  }
  return { message: "Unknown error", status: 0 };
}
