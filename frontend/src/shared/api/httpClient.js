const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiRequest(path, options = {}) {
  const { body, token, headers: customHeaders, ...requestOptions } = options;
  const headers = new Headers(customHeaders);
  let requestBody = body;

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("content-type", "application/json");
    requestBody = JSON.stringify(body);
  }

  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    body: requestBody,
    credentials: "include",
    headers,
  });
  const payload = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message || "The request could not be completed",
      response.status,
      payload?.error?.code,
    );
  }

  return payload;
}
