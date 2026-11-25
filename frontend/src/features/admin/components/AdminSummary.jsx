const sumCounts = (counts = {}) => {
  return Object.values(counts).reduce((total, count) => total + count, 0);
};

export function AdminSummary({ stats }) {
  const totalBookings = sumCounts(stats.bookingsByStatus);
  const openTickets =
    (stats.ticketStats.byStatus.OPEN ?? 0) +
    (stats.ticketStats.byStatus.IN_PROGRESS ?? 0);

  const cards = [
    { label: "Active resources", value: stats.activeResources },
    { label: "Total bookings", value: totalBookings },
    { label: "Open ticket workload", value: openTickets },
    {
      label: "Model agreement",
      value: `${stats.ticketStats.modelAgreementRate}%`,
    },
  ];

  return (
    <section className="admin-summary" aria-label="Administration summary">
      {cards.map((card, index) => (
        <article className="admin-metric" key={card.label}>
          <span className="admin-metric__index">0{index + 1}</span>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </article>
      ))}
    </section>
  );
}
