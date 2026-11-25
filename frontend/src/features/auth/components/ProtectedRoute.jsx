import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isRestoringSession } = useAuth();

  if (isRestoringSession) {
    return <div className="loading-screen">Restoring your session…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
