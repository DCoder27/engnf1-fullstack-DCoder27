import { useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth.js";
import { AvailabilityPanel } from "../components/AvailabilityPanel.jsx";
import { ResourceCatalogue } from "../components/ResourceCatalogue.jsx";
import { ResourceCatalogueFilters } from "../components/ResourceCatalogueFilters.jsx";
import { useResourceCatalogue } from "../hooks/useResourceCatalogue.js";
import "../styles/resources.css";

const EMPTY_FILTERS = {
  search: "",
  type: "",
  minCapacity: "",
};

export function ResourcesPage() {
  const { accessToken } = useAuth();
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedResource, setSelectedResource] = useState(null);
  const catalogue = useResourceCatalogue({ filters, page, token: accessToken });

  const handleApply = (event) => {
    event.preventDefault();
    setFilters({
      search: draftFilters.search.trim(),
      type: draftFilters.type,
      minCapacity: draftFilters.minCapacity,
    });
    setPage(1);
    setSelectedResource(null);
  };

  const handleReset = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPage(1);
    setSelectedResource(null);
  };

  return (
    <main className="page resources-page">
      <header className="resources-hero">
        <div>
          <span className="resources-hero__eyebrow">Shared spaces and equipment</span>
          <h1>Find the right resource.</h1>
          <p>Explore rooms, labs, and equipment before selecting a time that works.</p>
        </div>
        <div className="resources-hero__count">
          <strong>{catalogue.result.total}</strong>
          <span>matching resources</span>
        </div>
      </header>

      <ResourceCatalogueFilters
        draftFilters={draftFilters}
        onApply={handleApply}
        onChange={(field, value) => {
          setDraftFilters((current) => ({ ...current, [field]: value }));
        }}
        onReset={handleReset}
      />

      <div className="catalogue-summary">
        <span>Resource catalogue</span>
        <strong>{catalogue.result.total} results</strong>
      </div>

      <ResourceCatalogue
        {...catalogue}
        selectedId={selectedResource?.id}
        onSelect={setSelectedResource}
      />

      {selectedResource && (
        <AvailabilityPanel
          key={selectedResource.id}
          resource={selectedResource}
          token={accessToken}
          onClose={() => setSelectedResource(null)}
        />
      )}

      {catalogue.result.totalPages > 1 && (
        <nav className="catalogue-pagination" aria-label="Resource pages">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </button>
          <span>Page {page} of {catalogue.result.totalPages}</span>
          <button
            type="button"
            disabled={page === catalogue.result.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </main>
  );
}
