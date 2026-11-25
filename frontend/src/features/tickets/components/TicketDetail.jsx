import { TicketReviewForm } from "./TicketReviewForm.jsx";

const formatDate = (value) => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export function TicketDetail({ detail, error, isLoading, isSaving, mutationError, onReview }) {
  if (isLoading) {
    return <aside className="ticket-detail ticket-state">Loading ticket…</aside>;
  }

  if (error) {
    return <aside className="ticket-detail ticket-state ticket-state--error">{error}</aside>;
  }

  if (!detail) {
    return (
      <aside className="ticket-detail ticket-state">
        Select a ticket to review its content and audit history.
      </aside>
    );
  }

  const { events, ticket } = detail;

  return (
    <aside className="ticket-detail" aria-label="Selected ticket">
      <div className="ticket-detail__header">
        <span>{ticket.externalId}</span>
        <strong>{ticket.priority}</strong>
      </div>
      <h2>{ticket.subject}</h2>
      <p className="ticket-body">{ticket.body}</p>
      <dl className="ticket-facts">
        <div><dt>Auto category</dt><dd>{ticket.autoCategory}</dd></div>
        <div><dt>Current category</dt><dd>{ticket.category}</dd></div>
        <div><dt>Status</dt><dd>{ticket.status}</dd></div>
        <div><dt>Reviewed</dt><dd>{ticket.isReviewed ? "Yes" : "No"}</dd></div>
      </dl>

      {mutationError && <p className="ticket-inline-error" role="alert">{mutationError}</p>}
      <TicketReviewForm
        key={`${ticket.id}:${ticket.category}:${ticket.priority}:${ticket.status}:${ticket.assigneeId ?? ""}`}
        ticket={ticket}
        isSaving={isSaving}
        onSubmit={onReview}
      />

      <section className="event-history">
        <h3>Audit history</h3>
        {events.length === 0 ? (
          <p>No review events yet.</p>
        ) : (
          <ol>
            {events.map((event) => (
              <li key={event.id}>
                <strong>{event.field}</strong>: {event.oldValue ?? "empty"} → {event.newValue ?? "empty"}
                <span>{event.actor} · {formatDate(event.createdAt)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </aside>
  );
}
