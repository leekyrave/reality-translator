import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

// redirect to login if not authenticated, otherwise render children
const ProtectedRoute = ({ children }: Props) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
