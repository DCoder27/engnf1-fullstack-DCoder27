const TYPE_LABELS = {
  ROOM: "Room",
  LAB: "Lab",
  EQUIPMENT: "Equipment",
};

const TYPE_MARKS = {
  ROOM: "RM",
  LAB: "LB",
  EQUIPMENT: "EQ",
};

export function ResourceCard({ isSelected, onSelect, resource }) {
  return (
    <article
      className={`catalogue-card${resource.isActive ? "" : " is-inactive"}${isSelected ? " is-selected" : ""}`}
    >
      <div className="catalogue-card__topline">
        <span className="catalogue-card__mark" aria-hidden="true">
          {TYPE_MARKS[resource.type]}
        </span>
        <span className={`catalogue-card__status${resource.isActive ? "" : " is-inactive"}`}>
          {resource.isActive ? "Available" : "Unavailable"}
        </span>
      </div>
      <div className="catalogue-card__content">
        <span>{TYPE_LABELS[resource.type]}</span>
        <h2>{resource.name}</h2>
        <p>{resource.description || "A shared resource available for scheduled use."}</p>
      </div>
      <div className="catalogue-card__footer">
        <div>
          <strong>{resource.capacity}</strong>
          <span>capacity</span>
        </div>
        {resource.isActive ? (
          <button type="button" onClick={() => onSelect(resource)}>
            {isSelected ? "Selected" : "Check availability"}
          </button>
        ) : (
          <span>Bookings paused</span>
        )}
      </div>
    </article>
  );
}
