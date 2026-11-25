import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "../features/auth/components/ProtectedRoute.jsx";
import { RoleRoute } from "../features/auth/components/RoleRoute.jsx";
import { LoginPage } from "../features/auth/pages/LoginPage.jsx";
import { RegisterPage } from "../features/auth/pages/RegisterPage.jsx";
import { MyBookingsPage } from "../features/bookings/pages/MyBookingsPage.jsx";
import { AdminDashboardPage } from "../features/admin/pages/AdminDashboardPage.jsx";
import { ResourcesPage } from "../features/resources/pages/ResourcesPage.jsx";
import { TicketsPage } from "../features/tickets/pages/TicketsPage.jsx";
import { AppShell } from "../shared/components/AppShell.jsx";
import { NotFoundPage } from "../shared/pages/NotFoundPage.jsx";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/tickets" replace />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route path="admin" element={<AdminDashboardPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
