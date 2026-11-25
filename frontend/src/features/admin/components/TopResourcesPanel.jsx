export function TopResourcesPanel({ resources }) {
  const highestCount = resources[0]?.bookingCount ?? 1;

  return (
    <section className="admin-panel admin-panel--dark">
      <div className="admin-panel__heading">
        <div>
          <span>Resource demand</span>
          <h2>Most booked resources</h2>
        </div>
        <span className="admin-panel__badge">Top {resources.length}</span>
      </div>

      {resources.length === 0 ? (
        <p className="admin-empty">No booking activity is available yet.</p>
      ) : (
        <ol className="resource-ranking">
          {resources.map((resource, index) => (
            <li key={resource.resourceId}>
              <span className="resource-ranking__position">{index + 1}</span>
              <div className="resource-ranking__content">
                <div>
                  <strong>{resource.name}</strong>
                  <span>{resource.bookingCount} bookings</span>
                </div>
                <div className="resource-ranking__track" aria-hidden="true">
                  <span
                    style={{
                      width: `${(resource.bookingCount / highestCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
