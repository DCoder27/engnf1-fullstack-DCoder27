import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../features/auth/hooks/useAuth.js";

export function AppShell() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header__content">
          <NavLink className="brand" to="/">
            TriageSync
          </NavLink>
          <nav className="app-nav" aria-label="Primary navigation">
            <NavLink to="/">Home</NavLink>
            {user.role === "ADMIN" && <NavLink to="/admin">Admin</NavLink>}
          </nav>
          <span className="user-summary">{user.name}</span>
          <button className="secondary-button" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>
      <Outlet />
    </>
  );
}
