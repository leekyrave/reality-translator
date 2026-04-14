import { apiClient, BASE_URL } from "./client";
import type { ChatMessage } from "../types";

export interface SaveMessageResponse {
  workspaceId: string;
}

export const chatApi = {
  /**
   * Save a user message (with optional file attachment).
   * Creates a new workspace if no workspaceId is included in the FormData.
   * Returns the workspaceId to use for streaming.
   */
  saveMessage: (formData: FormData) =>
    apiClient.postForm<SaveMessageResponse>("/chat/message", formData),

  /**
   * Open an SSE stream for an existing workspace.
   * Returns a raw Response — caller is responsible for reading the body.
   */
  openStream: (workspaceId: string): Promise<Response> =>
    fetch(`${BASE_URL}/chat/stream/${workspaceId}`, {
      method: "GET",
      credentials: "include",
    }),

  /**
   * Fetch the full message history for a workspace.
   */
  getHistory: (workspaceId: string) =>
    apiClient.get<ChatMessage[]>(`/chat/history/${workspaceId}`),
};
