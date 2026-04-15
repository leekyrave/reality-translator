import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth";
import type { RegisterBody, LoginBody } from "../types";
import type { ReactNode } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  register: (data: RegisterBody) => Promise<void>;
  login: (data: LoginBody) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // true until session check completes
  const [error, setError] = useState<string | null>(null);

  // Verify cookie session on mount
  useEffect(() => {
    authApi
      .me()
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false))
      .finally(() => setIsLoading(false));
  }, []);

  const register = async (data: RegisterBody) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.register(data);
      setIsLoggedIn(true);
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginBody) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.login(data);
      setIsLoggedIn(true);
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    void authApi.logout();
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
