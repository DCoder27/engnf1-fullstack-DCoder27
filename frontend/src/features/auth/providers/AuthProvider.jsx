import { useEffect, useState } from "react";

import {
  loginRequest,
  logoutRequest,
  refreshSessionRequest,
  registerRequest,
} from "../api/authApi.js";
import { AuthContext } from "../context/authContext.js";

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    let isActive = true;

    refreshSessionRequest()
      .then((session) => {
        if (isActive) {
          setAccessToken(session.token);
          setUser(session.user);
        }
      })
      .catch(() => {
        if (isActive) {
          setAccessToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsRestoringSession(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const login = async (credentials) => {
    const session = await loginRequest(credentials);
    setAccessToken(session.token);
    setUser(session.user);
    return session.user;
  };

  const register = (details) => registerRequest(details);

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated: Boolean(accessToken && user),
        isRestoringSession,
        login,
        logout,
        register,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
