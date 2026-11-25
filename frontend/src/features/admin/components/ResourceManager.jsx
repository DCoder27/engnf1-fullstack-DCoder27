import { useState } from "react";

import { useResources } from "../hooks/useResources.js";
import { ResourceForm } from "./ResourceForm.jsx";

const EMPTY_FILTERS = { search: "", type: "" };

const TYPE_LABELS = {
  ROOM: "Room",
  LAB: "Lab",
  EQUIPMENT: "Equipment",
};

export function ResourceManager({ token, onResourceChange }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [editingResource, setEditingResource] = useState(null);
  const resources = useResources({
    filters,
    page,
    refreshVersion,
    token,
  });

  const setFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
    setEditingResource(null);
  };

  const handleSaved = () => {
    setEditingResource(null);
    setRefreshVersion((version) => version + 1);
    onResourceChange();
  };

  return (
    <section className="resource-manager">
      <div className="resource-manager__header">
        <div>
          <span>Inventory control</span>
          <h2>Manage resources</h2>
          <p>Create, update, activate, or pause bookable facilities and equipment.</p>
        </div>
        <strong>{resources.result.total} resources</strong>
      </div>

      <div className="resource-manager__layout">
        <div className="resource-catalogue">
          <div className="resource-filters">
            <label>
              <span>Search resources</span>
              <input
                type="search"
                value={filters.search}
                onChange={(event) => setFilter("search", event.target.value)}
                placeholder="Search by name"
              />
            </label>
            <label>
              <span>Resource type</span>
              <select
                value={filters.type}
                onChange={(event) => setFilter("type", event.target.value)}
              >
                <option value="">All types</option>
                <option value="ROOM">Rooms</option>
                <option value="LAB">Labs</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </label>
          </div>

          {resources.isLoading && <div className="resource-state">Loading resources…</div>}
          {!resources.isLoading && resources.error && (
            <div className="resource-state resource-state--error">{resources.error}</div>
          )}
          {!resources.isLoading && !resources.error && resources.result.data.length === 0 && (
            <div className="resource-state">No resources match these filters.</div>
          )}
          {!resources.isLoading && !resources.error && resources.result.data.length > 0 && (
            <div className="resource-list">
              {resources.result.data.map((resource) => (
                <button
                  className={`resource-card${editingResource?.id === resource.id ? " is-selected" : ""}`}
                  type="button"
                  key={resource.id}
                  onClick={() => setEditingResource(resource)}
                >
                  <span className="resource-card__icon" aria-hidden="true">
                    {TYPE_LABELS[resource.type].slice(0, 1)}
                  </span>
                  <span className="resource-card__content">
                    <span>
                      <strong>{resource.name}</strong>
                      <small>{TYPE_LABELS[resource.type]}</small>
                    </span>
                    <span>{resource.capacity} capacity</span>
                  </span>
                  <span className={`resource-card__status${resource.isActive ? "" : " is-inactive"}`}>
                    {resource.isActive ? "Active" : "Inactive"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {resources.result.totalPages > 1 && (
            <div className="resource-pagination">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>
              <span>Page {page} of {resources.result.totalPages}</span>
              <button
                type="button"
                disabled={page === resources.result.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>

        <ResourceForm
          key={editingResource?.id ?? "new"}
          resource={editingResource}
          token={token}
          onCancel={() => setEditingResource(null)}
          onSaved={handleSaved}
        />
      </div>
    </section>
  );
}
