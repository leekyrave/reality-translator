import { apiClient } from "./client";
import type { Workspace } from "../types";

export const workspaceApi = {
  getAll: () =>
    apiClient.get<Workspace[]>("/workspace"),

  getById: (id: string) =>
    apiClient.get<Workspace>(`/workspace/${id}`),

  create: (body: { title: string }) =>
    apiClient.post<{ id: string }>("/workspace", body),

  update: (id: string, body: { title?: string }) =>
    apiClient.patch<{ id: string }>(`/workspace/${id}`, body),

  delete: (id: string) =>
    apiClient.delete<Record<string, never>>(`/workspace/${id}`),
};
