import { useState } from "react";

import { createBooking } from "../api/bookingApi.js";

const formatDateTime = (value) => {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export function BookingForm({ from, resource, to, token }) {
  const [purpose, setPurpose] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedPurpose = purpose.trim();

    if (normalizedPurpose.length < 5 || normalizedPurpose.length > 200) {
      setError("Purpose must contain 5 to 200 characters.");
      return;
    }

    const normalizedTicketId = ticketId.trim();

    if (normalizedTicketId && !/^[0-9a-fA-F]{24}$/.test(normalizedTicketId)) {
      setError("Related ticket ID must be a valid 24-character ID.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const booking = await createBooking({
        booking: {
          resourceId: resource.id,
          startTime: new Date(from).toISOString(),
          endTime: new Date(to).toISOString(),
          purpose: normalizedPurpose,
          ...(normalizedTicketId ? { ticketId: normalizedTicketId } : {}),
        },
        token,
      });
      setCreatedBooking(booking);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (createdBooking) {
    return (
      <div className="booking-confirmation" role="status">
        <span aria-hidden="true">✓</span>
        <div>
          <strong>Booking request submitted</strong>
          <p>
            {resource.name} is requested for {formatDateTime(createdBooking.startTime)}.
            Its status is pending until an administrator reviews it.
          </p>
        </div>
        <span>{createdBooking.status}</span>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="booking-form__heading">
        <div>
          <span>Available window</span>
          <h3>Request this resource</h3>
        </div>
        <dl>
          <div>
            <dt>Starts</dt>
            <dd>{formatDateTime(from)}</dd>
          </div>
          <div>
            <dt>Ends</dt>
            <dd>{formatDateTime(to)}</dd>
          </div>
        </dl>
      </div>

      <div className="booking-form__fields">
        <label>
          Purpose of booking
          <textarea
            required
            rows="3"
            minLength="5"
            maxLength="200"
            value={purpose}
            onChange={(event) => {
              setPurpose(event.target.value);
              setError("");
            }}
            placeholder="Briefly explain how you will use this resource"
          />
          <small>{purpose.length}/200</small>
        </label>
        <label>
          Related ticket ID (optional)
          <input
            maxLength="24"
            value={ticketId}
            onChange={(event) => {
              setTicketId(event.target.value);
              setError("");
            }}
            placeholder="24-character ticket ID"
          />
        </label>
      </div>

      {error && <p className="booking-form__error">{error}</p>}
      <button type="submit" disabled={isSaving}>
        {isSaving ? "Submitting request…" : "Submit booking request"}
      </button>
    </form>
  );
}
