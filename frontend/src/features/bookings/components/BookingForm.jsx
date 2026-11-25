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

    setError("");
    setIsSaving(true);

    try {
      const booking = await createBooking({
        booking: {
          resourceId: resource.id,
          startTime: new Date(from).toISOString(),
          endTime: new Date(to).toISOString(),
          purpose: normalizedPurpose,
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

      {error && <p className="booking-form__error">{error}</p>}
      <button type="submit" disabled={isSaving}>
        {isSaving ? "Submitting request…" : "Submit booking request"}
      </button>
    </form>
  );
}
