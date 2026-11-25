import { ResourceCard } from "./ResourceCard.jsx";

export function ResourceCatalogue({ error, isLoading, onSelect, result, selectedId }) {
  if (isLoading) {
    return <div className="catalogue-state">Loading available resources…</div>;
  }

  if (error) {
    return (
      <div className="catalogue-state catalogue-state--error">
        <strong>Resources unavailable</strong>
        <span>{error}</span>
      </div>
    );
  }

  if (result.data.length === 0) {
    return (
      <div className="catalogue-state">
        <strong>No matching resources</strong>
        <span>Try changing or clearing your filters.</span>
      </div>
    );
  }

  return (
    <section className="catalogue-grid" aria-label="Resource catalogue">
      {result.data.map((resource) => (
        <ResourceCard
          isSelected={selectedId === resource.id}
          onSelect={onSelect}
          resource={resource}
          key={resource.id}
        />
      ))}
    </section>
  );
}
