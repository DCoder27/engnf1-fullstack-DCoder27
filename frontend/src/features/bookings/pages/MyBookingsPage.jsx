import { useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth.js";
import { cancelBooking } from "../api/bookingApi.js";
import { BookingCard } from "../components/BookingCard.jsx";
import { useBookingResourceNames } from "../hooks/useBookingResourceNames.js";
import { useMyBookings } from "../hooks/useMyBookings.js";
import "../styles/bookings.css";

const shortResourceId = (resourceId) => {
  return `Resource ${resourceId.slice(-6).toUpperCase()}`;
};

export function MyBookingsPage() {
  const { accessToken } = useAuth();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const bookings = useMyBookings({
    page,
    refreshVersion,
    status,
    token: accessToken,
  });
  const resourceNames = useBookingResourceNames(accessToken);

  const handleCancel = async (bookingId) => {
    setActionError("");
    setCancellingId(bookingId);

    try {
      await cancelBooking({ bookingId, token: accessToken });
      setConfirmingId(null);
      setRefreshVersion((version) => version + 1);
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <main className="page my-bookings-page">
      <header className="my-bookings-hero">
        <div>
          <span>Personal schedule</span>
          <h1>My bookings</h1>
          <p>Track approval decisions and manage your upcoming resource reservations.</p>
        </div>
        <div>
          <strong>{bookings.result.total}</strong>
          <span>{status ? status.toLowerCase() : "total"} bookings</span>
        </div>
      </header>

      <div className="my-bookings-toolbar">
        <label>
          Filter by status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
              setConfirmingId(null);
              setActionError("");
            }}
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
        <span>{bookings.result.total} results</span>
      </div>

      {actionError && <p className="my-bookings-error">{actionError}</p>}

      {bookings.isLoading && <div className="my-bookings-state">Loading your bookings…</div>}
      {!bookings.isLoading && bookings.error && (
        <div className="my-bookings-state my-bookings-state--error">
          <strong>Bookings unavailable</strong>
          <span>{bookings.error}</span>
        </div>
      )}
      {!bookings.isLoading && !bookings.error && bookings.result.data.length === 0 && (
        <div className="my-bookings-state">
          <strong>No bookings found</strong>
          <span>Your resource requests will appear here.</span>
        </div>
      )}
      {!bookings.isLoading && !bookings.error && bookings.result.data.length > 0 && (
        <section className="my-bookings-list" aria-label="My bookings">
          {bookings.result.data.map((booking) => (
            <BookingCard
              booking={booking}
              isCancelling={cancellingId === booking.id}
              isConfirming={confirmingId === booking.id}
              key={booking.id}
              onCancel={() => {
                setConfirmingId(booking.id);
                setActionError("");
              }}
              onConfirmCancel={() => handleCancel(booking.id)}
              onDismissCancel={() => setConfirmingId(null)}
              resourceName={resourceNames.get(booking.resourceId) ?? shortResourceId(booking.resourceId)}
            />
          ))}
        </section>
      )}

      {bookings.result.totalPages > 1 && (
        <nav className="my-bookings-pagination" aria-label="Booking pages">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => {
              setPage((current) => current - 1);
              setConfirmingId(null);
            }}
          >
            Previous
          </button>
          <span>Page {page} of {bookings.result.totalPages}</span>
          <button
            type="button"
            disabled={page === bookings.result.totalPages}
            onClick={() => {
              setPage((current) => current + 1);
              setConfirmingId(null);
            }}
          >
            Next
          </button>
        </nav>
      )}
    </main>
  );
}
