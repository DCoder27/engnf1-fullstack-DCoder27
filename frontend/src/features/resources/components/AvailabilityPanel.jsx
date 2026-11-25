import { useState } from "react";

import { BookingForm } from "../../bookings/components/BookingForm.jsx";
import { useResourceAvailability } from "../hooks/useResourceAvailability.js";

const HALF_HOUR = 30 * 60 * 1000;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const FOUR_HOURS = 4 * 60 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const toLocalInputValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const getInitialWindow = () => {
  const start = new Date(Math.ceil((Date.now() + HALF_HOUR) / HALF_HOUR) * HALF_HOUR);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    from: toLocalInputValue(start),
    to: toLocalInputValue(end),
  };
};

const formatDateTime = (value) => {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getBookingEligibilityError = ({ from, to }) => {
  const start = new Date(from);
  const end = new Date(to);
  const duration = end.getTime() - start.getTime();
  const isOnHalfHourGrid = [0, 30].includes(start.getUTCMinutes()) &&
    [0, 30].includes(end.getUTCMinutes()) &&
    start.getUTCSeconds() === 0 &&
    end.getUTCSeconds() === 0;

  if (!isOnHalfHourGrid) {
    return "To book this window, use start and end times ending in :00 or :30.";
  }

  if (duration < HALF_HOUR || duration > FOUR_HOURS || duration % HALF_HOUR !== 0) {
    return "A booking must last 30 minutes to 4 hours in 30-minute steps.";
  }

  if (start <= new Date()) {
    return "A booking must start in the future.";
  }

  if (start.getTime() - Date.now() > THIRTY_DAYS) {
    return "A booking may be scheduled no more than 30 days ahead.";
  }

  return "";
};

export function AvailabilityPanel({ resource, token, onClose }) {
  const [window, setWindow] = useState(getInitialWindow);
  const [validationError, setValidationError] = useState("");
  const availability = useResourceAvailability(token);

  const setWindowField = (field, value) => {
    setWindow((current) => ({ ...current, [field]: value }));
    setValidationError("");
    availability.clearAvailability();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const from = new Date(window.from);
    const to = new Date(window.to);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      setValidationError("Choose both a start and end time.");
      return;
    }

    if (to <= from) {
      setValidationError("End time must be later than start time.");
      return;
    }

    if (to.getTime() - from.getTime() > SEVEN_DAYS) {
      setValidationError("Availability can be checked for a maximum of seven days.");
      return;
    }

    setValidationError("");
    availability.checkAvailability({
      resourceId: resource.id,
      from: window.from,
      to: window.to,
    });
  };

  const conflicts = availability.availability?.bookings ?? [];
  const bookingEligibilityError = availability.availability && conflicts.length === 0
    ? getBookingEligibilityError(window)
    : "";

  return (
    <section className="availability-panel" aria-labelledby="availability-heading">
      <div className="availability-panel__header">
        <div>
          <span>Selected resource</span>
          <h2 id="availability-heading">{resource.name}</h2>
          <p>Choose a window of up to seven days to view existing reservations.</p>
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </div>

      <form className="availability-form" onSubmit={handleSubmit}>
        <label>
          Start date and time
          <input
            required
            type="datetime-local"
            step="1800"
            value={window.from}
            onChange={(event) => setWindowField("from", event.target.value)}
          />
        </label>
        <label>
          End date and time
          <input
            required
            type="datetime-local"
            step="1800"
            min={window.from}
            value={window.to}
            onChange={(event) => setWindowField("to", event.target.value)}
          />
        </label>
        <button type="submit" disabled={availability.isLoading}>
          {availability.isLoading ? "Checking…" : "Check availability"}
        </button>
      </form>

      {(validationError || availability.error) && (
        <p className="availability-message availability-message--error">
          {validationError || availability.error}
        </p>
      )}

      {availability.availability && conflicts.length === 0 && (
        <>
          <div className="availability-result availability-result--free">
            <span aria-hidden="true">✓</span>
            <div>
              <strong>This window is available</strong>
              <p>No pending or approved bookings overlap the selected period.</p>
            </div>
          </div>
          {bookingEligibilityError ? (
            <p className="availability-message availability-message--guidance">
              {bookingEligibilityError}
            </p>
          ) : (
            <BookingForm
              from={window.from}
              resource={resource}
              to={window.to}
              token={token}
            />
          )}
        </>
      )}

      {availability.availability && conflicts.length > 0 && (
        <div className="availability-result">
          <div className="availability-result__heading">
            <div>
              <strong>{conflicts.length} conflicting {conflicts.length === 1 ? "booking" : "bookings"}</strong>
              <span>Choose a time outside these reserved periods.</span>
            </div>
            <span>{formatDateTime(availability.availability.from)} – {formatDateTime(availability.availability.to)}</span>
          </div>
          <ol className="availability-conflicts">
            {conflicts.map((booking, index) => (
              <li key={`${booking.startTime}-${booking.endTime}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{formatDateTime(booking.startTime)}</strong>
                  <small>Until {formatDateTime(booking.endTime)}</small>
                </div>
                <span>{booking.status}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
