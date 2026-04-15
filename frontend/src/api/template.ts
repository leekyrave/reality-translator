import { apiClient } from "./client";
import type { Template } from "../types";

export const templateApi = {
  getAll: () =>
    apiClient.get<Template[]>("/template"),

  getById: (id: string) =>
    apiClient.get<Template>(`/template/${id}`),

  create: (body: { title: string; role: string; content: string }) =>
    apiClient.post<{ id: string }>("/template", body),

  update: (id: string, body: { title?: string; role?: string; content?: string; isDefault?: boolean }) =>
    apiClient.patch<{ id: string }>(`/template/${id}`, body),

  delete: (id: string) =>
    apiClient.delete<Record<string, never>>(`/template/${id}`),
};
