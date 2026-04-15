import { apiClient } from "./client";
import type { RegisterBody, LoginBody } from "../types";

export const authApi = {
  register: (data: RegisterBody) => apiClient.post("/auth/register", data),

  login: (data: LoginBody) => apiClient.post("/auth/login", data),

  logout: () => apiClient.post("/auth/logout", {}),

  me: () => apiClient.get<{ id: string; email: string }>("/auth/me"),
};
