import { api, tokenStorage } from "./client";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/types";

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const authApi = {
  /** POST /auth/login → returns user + tokens, stores them automatically */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    tokenStorage.setAccess(data.tokens.accessToken);
    if (data.tokens.refreshToken) tokenStorage.setRefresh(data.tokens.refreshToken);
    return data;
  },

  /** POST /auth/register → same as login */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    tokenStorage.setAccess(data.tokens.accessToken);
    if (data.tokens.refreshToken) tokenStorage.setRefresh(data.tokens.refreshToken);
    return data;
  },

  /** GET /auth/me → current user info */
  me: async (): Promise<User> => {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  /** POST /auth/logout → clears tokens */
  logout: async (): Promise<void> => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    tokenStorage.clearAll();
  },

  /** POST /auth/refresh → get a new access token */
  refresh: async (refreshToken: string): Promise<string> => {
    const { data } = await api.post<{ accessToken: string }>("/auth/refresh", { refreshToken });
    tokenStorage.setAccess(data.accessToken);
    return data.accessToken;
  },
};
