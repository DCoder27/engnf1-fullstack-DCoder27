import { useState } from "react";

import { approveBooking, rejectBooking } from "../api/adminApi.js";
import { useAdminBookings } from "../hooks/useAdminBookings.js";
import { useResourceOptions } from "../hooks/useResourceOptions.js";

const EMPTY_FILTERS = {
  status: "",
  resourceId: "",
  from: "",
  to: "",
};

const formatDateTime = (value) => {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const shortId = (value) => value.slice(-6).toUpperCase();

export function BookingManager({ token, onBookingChange }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [actionError, setActionError] = useState("");
  const [workingId, setWorkingId] = useState(null);
  const resources = useResourceOptions(token);
  const bookings = useAdminBookings({
    filters,
    page,
    refreshVersion,
    token,
  });
  const resourceNames = new Map(resources.map((resource) => [resource.id, resource.name]));

  const setFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
    setActionError("");
  };

  const refreshAfterAction = () => {
    setRefreshVersion((version) => version + 1);
    onBookingChange();
  };

  const handleApprove = async (bookingId) => {
    setActionError("");
    setWorkingId(bookingId);

    try {
      await approveBooking({ bookingId, token });
      refreshAfterAction();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setWorkingId(null);
    }
  };

  const handleReject = async (event) => {
    event.preventDefault();
    const note = rejectionNote.trim();

    if (note.length < 5 || note.length > 200) {
      setActionError("Rejection reason must contain 5 to 200 characters.");
      return;
    }

    setActionError("");
    setWorkingId(rejectingId);

    try {
      await rejectBooking({ bookingId: rejectingId, note, token });
      setRejectingId(null);
      setRejectionNote("");
      refreshAfterAction();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setWorkingId(null);
    }
  };

  const openRejectForm = (bookingId) => {
    setRejectingId(bookingId);
    setRejectionNote("");
    setActionError("");
  };

  const dateRangeIncomplete = Boolean(filters.from) !== Boolean(filters.to);

  return (
    <section className="booking-manager">
      <div className="booking-manager__header">
        <div>
          <span>Approval queue</span>
          <h2>Manage bookings</h2>
          <p>Review requests and control access to shared resources.</p>
        </div>
        <strong>{bookings.result.total} bookings</strong>
      </div>

      <div className="booking-filters">
        <label>
          Status
          <select value={filters.status} onChange={(event) => setFilter("status", event.target.value)}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
        <label>
          Resource
          <select
            value={filters.resourceId}
            onChange={(event) => setFilter("resourceId", event.target.value)}
          >
            <option value="">All resources</option>
            {resources.map((resource) => (
              <option value={resource.id} key={resource.id}>{resource.name}</option>
            ))}
          </select>
        </label>
        <label>
          From
          <input
            type="datetime-local"
            value={filters.from}
            onChange={(event) => setFilter("from", event.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="datetime-local"
            value={filters.to}
            min={filters.from}
            onChange={(event) => setFilter("to", event.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setFilters(EMPTY_FILTERS);
            setPage(1);
          }}
        >
          Clear
        </button>
      </div>

      {dateRangeIncomplete && (
        <p className="booking-manager__notice">Choose both From and To to apply a date range.</p>
      )}
      {actionError && <p className="booking-manager__notice">{actionError}</p>}

      {bookings.isLoading && <div className="booking-state">Loading bookings…</div>}
      {!bookings.isLoading && bookings.error && (
        <div className="booking-state booking-state--error">{bookings.error}</div>
      )}
      {!bookings.isLoading && !bookings.error && bookings.result.data.length === 0 && (
        <div className="booking-state">No bookings match these filters.</div>
      )}
      {!bookings.isLoading && !bookings.error && bookings.result.data.length > 0 && (
        <div className="booking-table-wrap">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Schedule</th>
                <th>Requester</th>
                <th>Status</th>
                <th><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {bookings.result.data.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>{resourceNames.get(booking.resourceId) ?? `Resource ${shortId(booking.resourceId)}`}</strong>
                    <span>{booking.purpose}</span>
                  </td>
                  <td>
                    <strong>{formatDateTime(booking.startTime)}</strong>
                    <span>until {formatDateTime(booking.endTime)}</span>
                  </td>
                  <td>User {shortId(booking.userId)}</td>
                  <td>
                    <span className={`booking-status booking-status--${booking.status.toLowerCase()}`}>
                      {booking.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    {booking.status === "PENDING" ? (
                      <div className="booking-actions">
                        <button
                          type="button"
                          disabled={workingId === booking.id}
                          onClick={() => handleApprove(booking.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={workingId === booking.id}
                          onClick={() => openRejectForm(booking.id)}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="booking-decision-note">{booking.decisionNote ?? "Decision complete"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {bookings.result.totalPages > 1 && (
        <div className="booking-pagination">
          <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
            Previous
          </button>
          <span>Page {page} of {bookings.result.totalPages}</span>
          <button
            type="button"
            disabled={page === bookings.result.totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </button>
        </div>
      )}

      {rejectingId && (
        <form className="rejection-form" onSubmit={handleReject}>
          <div>
            <strong>Reject booking request</strong>
            <span>Explain why this request cannot be approved.</span>
          </div>
          <label>
            Rejection reason
            <textarea
              required
              autoFocus
              rows="3"
              minLength="5"
              maxLength="200"
              value={rejectionNote}
              onChange={(event) => setRejectionNote(event.target.value)}
            />
            <small>{rejectionNote.length}/200</small>
          </label>
          <div className="rejection-form__actions">
            <button
              type="button"
              onClick={() => {
                setRejectingId(null);
                setRejectionNote("");
              }}
            >
              Cancel
            </button>
            <button type="submit" disabled={workingId === rejectingId}>
              {workingId === rejectingId ? "Rejecting…" : "Confirm rejection"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
