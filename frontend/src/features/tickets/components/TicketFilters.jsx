const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const CATEGORY_OPTIONS = [
  "BILLING",
  "BUG",
  "FEATURE_REQUEST",
  "LOGIN",
  "DELIVERY",
];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const formatOption = (value) => value.replaceAll("_", " ");

export function TicketFilters({ filters, onChange, onReset }) {
  const updateFilter = (field) => (event) => {
    onChange(field, event.target.value);
  };

  return (
    <section className="ticket-filters" aria-label="Ticket filters">
      <div className="ticket-filter ticket-filter--search">
        <label htmlFor="ticket-search">Search subject or body</label>
        <input
          id="ticket-search"
          type="search"
          maxLength="200"
          placeholder="Search tickets"
          value={filters.q}
          onChange={updateFilter("q")}
        />
      </div>

      <FilterSelect
        id="ticket-status"
        label="Status"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={updateFilter("status")}
      />
      <FilterSelect
        id="ticket-category"
        label="Category"
        options={CATEGORY_OPTIONS}
        value={filters.category}
        onChange={updateFilter("category")}
      />
      <FilterSelect
        id="ticket-priority"
        label="Priority"
        options={PRIORITY_OPTIONS}
        value={filters.priority}
        onChange={updateFilter("priority")}
      />

      <button className="ticket-reset" type="button" onClick={onReset}>
        Clear filters
      </button>
    </section>
  );
}

function FilterSelect({ id, label, onChange, options, value }) {
  return (
    <div className="ticket-filter">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={onChange}>
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatOption(option)}
          </option>
        ))}
      </select>
    </div>
  );
}
