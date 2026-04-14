export interface User {       // must be first
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  user?: User;               // using User
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

export type genericType<T> = {
  data: T;
}

// const test: genericType<LoginBody> = {
//   data: {
//     email: "example@example.com",
//     password: "password123"
//   }}

export interface SimplificationResult {
  original_excerpt: string;
  simplified: string;
  jargon_terms?: { term: string; definition: string }[];
  legal_guardrail?: { excerpt: string; warning: string; label: string };
}