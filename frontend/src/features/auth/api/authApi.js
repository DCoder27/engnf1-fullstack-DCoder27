import { apiRequest } from "../../../shared/api/httpClient.js";

export const loginRequest = (credentials) => {
  return apiRequest("/auth/login", { method: "POST", body: credentials });
};

export const registerRequest = (details) => {
  return apiRequest("/auth/register", { method: "POST", body: details });
};

export const refreshSessionRequest = () => {
  return apiRequest("/auth/refresh", { method: "POST" });
};

export const logoutRequest = () => {
  return apiRequest("/auth/logout", { method: "POST" });
};
