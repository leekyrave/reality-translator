import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-400 text-sm">Checking session…</span>
      </div>
    );
  }

  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;