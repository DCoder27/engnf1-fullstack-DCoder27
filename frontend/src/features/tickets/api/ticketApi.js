import { apiRequest } from "../../../shared/api/httpClient.js";

const buildQuery = (values) => {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value !== "" && value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  }

  return query.toString();
};

export const getTicketStats = ({ token, signal }) => {
  return apiRequest("/stats", { token, signal });
};

export const getTickets = ({ filters, page, token, signal }) => {
  const query = buildQuery({ ...filters, page, limit: 10 });
  return apiRequest(`/tickets?${query}`, { token, signal });
};

export const getTicket = ({ ticketId, token, signal }) => {
  return apiRequest(`/tickets/${ticketId}`, { token, signal });
};

export const patchTicket = ({ ticketId, updates, token, agent }) => {
  return apiRequest(`/tickets/${ticketId}`, {
    method: "PATCH",
    token,
    headers: { "X-Agent": agent },
    body: updates,
  });
};

export const importTicketFeed = ({ tickets, token }) => {
  return apiRequest("/tickets/import", {
    method: "POST",
    token,
    body: { tickets },
  });
};
