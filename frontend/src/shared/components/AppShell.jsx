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
            <span className="brand-mark" aria-hidden="true">TS</span>
            <span>TriageSync</span>
          </NavLink>
          <nav className="app-nav" aria-label="Primary navigation">
            <NavLink to="/tickets">Tickets</NavLink>
            {user.role === "ADMIN" && <NavLink to="/admin">Admin</NavLink>}
          </nav>
          <div className="user-chip">
            <span className="user-avatar" aria-hidden="true">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="user-details">
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </span>
          </div>
          <button className="secondary-button" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>
      <Outlet />
    </>
  );
}
