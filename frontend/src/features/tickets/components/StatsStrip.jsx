const sumCounts = (counts = {}) => {
  return Object.values(counts).reduce((total, count) => total + count, 0);
};

export function StatsStrip({ error, stats }) {
  if (error) {
    return <p className="ticket-inline-error">Statistics: {error}</p>;
  }

  const cards = [
    { label: "Total tickets", value: stats ? sumCounts(stats.byStatus) : "—" },
    { label: "Open", value: stats?.byStatus.OPEN ?? "—" },
    { label: "Reviewed", value: stats?.reviewedCount ?? "—" },
    {
      label: "Model agreement",
      value: stats ? `${stats.modelAgreementRate}%` : "—",
    },
  ];

  return (
    <section className="stats-strip" aria-label="Ticket statistics">
      {cards.map((card) => (
        <article className="stat-card" key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </article>
      ))}
    </section>
  );
}
