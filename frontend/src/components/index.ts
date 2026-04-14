export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  access_token: string;
  user?: User;
  data?: any;
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
