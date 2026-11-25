import { apiRequest } from "../../../shared/api/httpClient.js";

const buildQuery = ({ filters, page }) => {
  const query = new URLSearchParams({ page: String(page) });

  if (filters.search) {
    query.set("search", filters.search);
  }

  if (filters.type) {
    query.set("type", filters.type);
  }

  if (filters.minCapacity) {
    query.set("minCapacity", filters.minCapacity);
  }

  return query.toString();
};

export const getResources = ({ filters, page, token, signal }) => {
  const query = buildQuery({ filters, page });
  return apiRequest(`/resources?${query}`, { token, signal });
};

export const getResourceAvailability = ({ resourceId, from, to, token, signal }) => {
  const query = new URLSearchParams({
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
  });

  return apiRequest(`/resources/${resourceId}/availability?${query}`, {
    token,
    signal,
  });
};
