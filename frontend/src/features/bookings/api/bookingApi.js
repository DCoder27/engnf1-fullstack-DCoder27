import { apiRequest } from "../../../shared/api/httpClient.js";

export const createBooking = ({ booking, token }) => {
  return apiRequest("/bookings", {
    method: "POST",
    body: booking,
    token,
  });
};

export const getMyBookings = ({ page, status, token, signal }) => {
  const query = new URLSearchParams({ page: String(page) });

  if (status) {
    query.set("status", status);
  }

  return apiRequest(`/bookings/mine?${query}`, { token, signal });
};

export const cancelBooking = ({ bookingId, token }) => {
  return apiRequest(`/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    token,
  });
};
