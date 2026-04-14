import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "../api/auth";
import { tokenStorage } from "../api/client";
import type { LoginPayload, RegisterPayload, User } from "../types/types";

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthState {
  user:      User | null;
  loading:   boolean;
  error:     string | null;
}

interface AuthContextValue extends AuthState {
  login:    (p: LoginPayload)    => Promise<void>;
  register: (p: RegisterPayload) => Promise<void>;
  logout:   ()                   => Promise<void>;
  clearError: ()                 => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:    null,
    loading: true,
    error:   null,
  });

  const set = (partial: Partial<AuthState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  // On mount, restore session
  useEffect(() => {
    const restore = async () => {
      const token = tokenStorage.getAccess();
      if (!token) { set({ loading: false }); return; }
      try {
        const user = await authApi.me();
        set({ user, loading: false });
      } catch {
        tokenStorage.clearAll();
        set({ loading: false });
      }
    };
    restore();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    set({ loading: true, error: null });
    try {
      const { user } = await authApi.login(payload);
      set({ user, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.response?.data?.message ?? "Login failed" });
      throw e;
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    set({ loading: true, error: null });
    try {
      const { user } = await authApi.register(payload);
      set({ user, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.response?.data?.message ?? "Registration failed" });
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    set({ loading: true });
    await authApi.logout();
    set({ user: null, loading: false });
  }, []);

  const clearError = useCallback(() => set({ error: null }), []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, logout, clearError }),
    [state, login, register, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
