import { apiRequest } from "../../../shared/api/httpClient.js";

export const getAdminStats = ({ token, signal }) => {
  return apiRequest("/admin/stats", { token, signal });
};

const buildResourceQuery = ({ page, search, type }) => {
  const query = new URLSearchParams({ page: String(page) });

  if (search.trim()) {
    query.set("search", search.trim());
  }

  if (type) {
    query.set("type", type);
  }

  return query.toString();
};

export const getResources = ({ filters, page, token, signal }) => {
  const query = buildResourceQuery({ ...filters, page });
  return apiRequest(`/resources?${query}`, { token, signal });
};

export const createResource = ({ resource, token }) => {
  return apiRequest("/resources", {
    method: "POST",
    body: resource,
    token,
  });
};

export const updateResource = ({ resourceId, updates, token }) => {
  return apiRequest(`/resources/${resourceId}`, {
    method: "PATCH",
    body: updates,
    token,
  });
};

const toUtcDateTime = (value) => {
  return value ? new Date(value).toISOString() : "";
};

export const getAdminBookings = ({ filters, page, token, signal }) => {
  const query = new URLSearchParams({ page: String(page) });

  if (filters.status) {
    query.set("status", filters.status);
  }

  if (filters.resourceId) {
    query.set("resourceId", filters.resourceId);
  }

  if (filters.from && filters.to) {
    query.set("from", toUtcDateTime(filters.from));
    query.set("to", toUtcDateTime(filters.to));
  }

  return apiRequest(`/bookings?${query.toString()}`, { token, signal });
};

export const approveBooking = ({ bookingId, token }) => {
  return apiRequest(`/bookings/${bookingId}/approve`, {
    method: "PATCH",
    token,
  });
};

export const rejectBooking = ({ bookingId, note, token }) => {
  return apiRequest(`/bookings/${bookingId}/reject`, {
    method: "PATCH",
    body: { note },
    token,
  });
};
