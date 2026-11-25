const LABELS = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export function TicketInsightsPanel({ ticketStats }) {
  const total = Object.values(ticketStats.byStatus).reduce(
    (sum, count) => sum + count,
    0,
  );
  const reviewedPercentage =
    total === 0 ? 0 : Math.round((ticketStats.reviewedCount / total) * 100);

  return (
    <section className="admin-panel admin-panel--wide">
      <div className="admin-panel__heading">
        <div>
          <span>Support quality</span>
          <h2>Ticket intelligence</h2>
        </div>
        <strong>{ticketStats.reviewedCount} reviewed</strong>
      </div>

      <div className="ticket-insights">
        <div className="ticket-insights__ring" style={{ "--progress": `${reviewedPercentage * 3.6}deg` }}>
          <div>
            <strong>{reviewedPercentage}%</strong>
            <span>reviewed</span>
          </div>
        </div>
        <dl>
          {Object.entries(LABELS).map(([status, label]) => (
            <div key={status}>
              <dt>{label}</dt>
              <dd>{ticketStats.byStatus[status] ?? 0}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
