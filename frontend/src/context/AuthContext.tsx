import { createContext, useContext, useState } from "react";
import { authApi } from "../api/auth";
import type { RegisterBody, LoginBody } from "../types";
import type { ReactNode } from 'react';
import { apiClient } from "../api/client";
import { useEffect } from "react";

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
  const [isLoggedIn, setIsLoggedIn] = useState(true); //new cookie log check hook
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    authApi.logout();
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isLoading, error, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// hook to use auth context in components
export const  useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
