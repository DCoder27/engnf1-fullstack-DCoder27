const formatDateTime = (value) => {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatDuration = (startTime, endTime) => {
  const minutes = Math.round(
    (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000,
  );
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
};

export function BookingCard({
  booking,
  isCancelling,
  isConfirming,
  onCancel,
  onConfirmCancel,
  onDismissCancel,
  resourceName,
}) {
  const isFuture = new Date(booking.startTime) > new Date();
  const canCancel = isFuture && ["PENDING", "APPROVED"].includes(booking.status);

  return (
    <article className="my-booking-card">
      <div className="my-booking-card__date" aria-hidden="true">
        <strong>{new Date(booking.startTime).getDate()}</strong>
        <span>{new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(booking.startTime))}</span>
      </div>

      <div className="my-booking-card__main">
        <div className="my-booking-card__title">
          <div>
            <span>{resourceName}</span>
            <h2>{booking.purpose}</h2>
          </div>
          <span className={`my-booking-status my-booking-status--${booking.status.toLowerCase()}`}>
            {booking.status}
          </span>
        </div>

        <dl className="my-booking-card__facts">
          <div>
            <dt>Starts</dt>
            <dd>{formatDateTime(booking.startTime)}</dd>
          </div>
          <div>
            <dt>Ends</dt>
            <dd>{formatDateTime(booking.endTime)}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{formatDuration(booking.startTime, booking.endTime)}</dd>
          </div>
        </dl>

        {booking.decisionNote && (
          <p className="my-booking-card__note">
            <strong>Decision note:</strong> {booking.decisionNote}
          </p>
        )}

        {canCancel && !isConfirming && (
          <button className="my-booking-card__cancel" type="button" onClick={onCancel}>
            Cancel booking
          </button>
        )}

        {isConfirming && (
          <div className="cancel-confirmation">
            <div>
              <strong>Cancel this booking?</strong>
              <span>The reserved time will become available to other users.</span>
            </div>
            <div>
              <button type="button" onClick={onDismissCancel}>Keep booking</button>
              <button type="button" disabled={isCancelling} onClick={onConfirmCancel}>
                {isCancelling ? "Cancelling…" : "Confirm cancellation"}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
