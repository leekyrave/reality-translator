export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  name?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export interface Workspace {
  id: string;
  title: string;
  messagesCount: number;
}

export interface Template {
  id: string;
  title: string;
  role: string;
  content: string;
  isDefault: boolean;
}
