const formatLabel = (value) => value.replaceAll("_", " ");

export function TicketQueue({
  error,
  isLoading,
  onPageChange,
  onSelect,
  result,
  selectedId,
}) {
  if (isLoading) {
    return <div className="ticket-state">Loading tickets…</div>;
  }

  if (error) {
    return <div className="ticket-state ticket-state--error">{error}</div>;
  }

  if (result.data.length === 0) {
    return <div className="ticket-state">No tickets match these filters.</div>;
  }

  return (
    <section className="ticket-queue" aria-label="Ticket queue">
      <div className="ticket-queue__summary">
        <strong>{result.total} tickets</strong>
        <span>
          Page {result.page} of {Math.max(result.totalPages, 1)}
        </span>
      </div>

      <div className="ticket-list">
        {result.data.map((ticket) => (
          <button
            className={`ticket-list-item${selectedId === ticket.id ? " is-selected" : ""}`}
            type="button"
            key={ticket.id}
            aria-pressed={selectedId === ticket.id}
            onClick={() => onSelect(ticket.id)}
          >
            <span className="ticket-list-item__title">{ticket.subject}</span>
            <span className="ticket-list-item__meta">
              <span className={`ticket-badge ticket-badge--${ticket.priority.toLowerCase()}`}>
                {ticket.priority}
              </span>
              <span>{formatLabel(ticket.category)}</span>
              <span>{formatLabel(ticket.status)}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="ticket-pagination" aria-label="Ticket pagination">
        <button
          type="button"
          disabled={result.page <= 1}
          onClick={() => onPageChange(result.page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={result.page >= result.totalPages}
          onClick={() => onPageChange(result.page + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
