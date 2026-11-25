const LABELS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

export function BookingStatusPanel({ counts }) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <section className="admin-panel">
      <div className="admin-panel__heading">
        <div>
          <span>Booking operations</span>
          <h2>Status distribution</h2>
        </div>
        <strong>{total} total</strong>
      </div>

      <div className="status-distribution">
        {Object.entries(LABELS).map(([status, label]) => {
          const count = counts[status] ?? 0;
          const percentage = total === 0 ? 0 : Math.round((count / total) * 100);

          return (
            <div className="status-row" key={status}>
              <div className="status-row__label">
                <span>{label}</span>
                <strong>{count}</strong>
              </div>
              <div
                className="status-row__track"
                role="progressbar"
                aria-label={`${label} bookings`}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={percentage}
              >
                <span style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
