export function ResourceCatalogueFilters({ draftFilters, onApply, onChange, onReset }) {
  return (
    <form className="catalogue-filters" onSubmit={onApply}>
      <label className="catalogue-filters__search">
        <span>Search resources</span>
        <input
          type="search"
          maxLength="100"
          value={draftFilters.search}
          onChange={(event) => onChange("search", event.target.value)}
          placeholder="Search by resource name"
        />
      </label>
      <label>
        <span>Type</span>
        <select
          value={draftFilters.type}
          onChange={(event) => onChange("type", event.target.value)}
        >
          <option value="">All types</option>
          <option value="ROOM">Rooms</option>
          <option value="LAB">Labs</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>
      </label>
      <label>
        <span>Minimum capacity</span>
        <input
          type="number"
          min="1"
          max="500"
          step="1"
          value={draftFilters.minCapacity}
          onChange={(event) => onChange("minCapacity", event.target.value)}
          placeholder="Any capacity"
        />
      </label>
      <button className="catalogue-filters__apply" type="submit">Apply filters</button>
      <button className="catalogue-filters__reset" type="button" onClick={onReset}>Reset</button>
    </form>
  );
}
