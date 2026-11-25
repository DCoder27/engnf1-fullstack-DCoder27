import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "../features/auth/components/ProtectedRoute.jsx";
import { RoleRoute } from "../features/auth/components/RoleRoute.jsx";
import { LoginPage } from "../features/auth/pages/LoginPage.jsx";
import { RegisterPage } from "../features/auth/pages/RegisterPage.jsx";
import { TicketsPage } from "../features/tickets/pages/TicketsPage.jsx";
import { AppShell } from "../shared/components/AppShell.jsx";
import { NotFoundPage } from "../shared/pages/NotFoundPage.jsx";
import { AdminPlaceholderPage } from "./pages/AdminPlaceholderPage.jsx";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/tickets" replace />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route path="admin" element={<AdminPlaceholderPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
