import { useRef, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth.js";
import { importTicketFeed, patchTicket } from "../api/ticketApi.js";
import { StatsStrip } from "../components/StatsStrip.jsx";
import { TicketDetail } from "../components/TicketDetail.jsx";
import { TicketFilters } from "../components/TicketFilters.jsx";
import { TicketQueue } from "../components/TicketQueue.jsx";
import { useTicketDetail } from "../hooks/useTicketDetail.js";
import { useTicketQueue } from "../hooks/useTicketQueue.js";
import { useTicketStats } from "../hooks/useTicketStats.js";
import "../styles/tickets.css";

const EMPTY_FILTERS = {
  status: "",
  category: "",
  priority: "",
  q: "",
};

export function TicketsPage() {
  const { accessToken, user } = useAuth();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const [statsVersion, setStatsVersion] = useState(0);
  const [importMessage, setImportMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const feedInputRef = useRef(null);

  const queue = useTicketQueue({ filters, page, token: accessToken });
  const activeTicketId =
    selectedId ?? (!queue.isLoading ? queue.result.data[0]?.id : null);
  const ticketDetail = useTicketDetail({
    ticketId: activeTicketId,
    token: accessToken,
  });
  const ticketStats = useTicketStats({
    refreshVersion: statsVersion,
    token: accessToken,
  });

  const clearSelection = () => {
    setSelectedId(null);
    setMutationError("");
  };

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
    clearSelection();
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
    clearSelection();
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    clearSelection();
  };

  const handleReview = async (updates) => {
    if (Object.keys(updates).length === 0) {
      setMutationError("Change at least one field before saving.");
      return;
    }

    const previousDetail = ticketDetail.detail;
    const optimisticTicket = { ...previousDetail.ticket, ...updates };

    setMutationError("");
    setIsSaving(true);
    ticketDetail.setDetail({ ...previousDetail, ticket: optimisticTicket });
    queue.replaceTicket(optimisticTicket);

    try {
      const updatedDetail = await patchTicket({
        ticketId: previousDetail.ticket.id,
        updates,
        token: accessToken,
        agent: user.email,
      });
      ticketDetail.setDetail(updatedDetail);
      queue.replaceTicket(updatedDetail.ticket);
      setStatsVersion((version) => version + 1);
    } catch (requestError) {
      ticketDetail.setDetail(previousDetail);
      queue.replaceTicket(previousDetail.ticket);
      setMutationError(`${requestError.message} Your changes were rolled back.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeedFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImportMessage("");
    setIsImporting(true);

    try {
      const parsedFeed = JSON.parse(await file.text());
      const tickets = Array.isArray(parsedFeed) ? parsedFeed : parsedFeed.tickets;

      if (!Array.isArray(tickets) || tickets.length === 0) {
        throw new Error("Choose a JSON array of tickets or an object with a tickets array.");
      }

      const result = await importTicketFeed({ tickets, token: accessToken });
      setImportMessage(
        `Feed processed: ${result.importedCount} imported, ${result.updatedCount} updated, ${result.skippedOverrideCount} human overrides preserved.`,
      );
      queue.reload();
      setStatsVersion((version) => version + 1);
    } catch (requestError) {
      setImportMessage(`Import failed: ${requestError.message}`);
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  return (
    <main className="page tickets-page">
      <header className="tickets-heading">
        <div>
          <span className="tickets-heading__eyebrow">Agent workspace</span>
          <h1>Ticket triage queue</h1>
          <p>Filter incoming support work and review each change with an audit trail.</p>
        </div>
        <div className="tickets-heading__actions">
          <div className="tickets-heading__status">
            <span aria-hidden="true" />
            {queue.result.total} live tickets
          </div>
          <input
            className="visually-hidden"
            ref={feedInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFeedFile}
          />
          <button
            type="button"
            disabled={isImporting}
            onClick={() => feedInputRef.current?.click()}
          >
            {isImporting ? "Importing…" : "Re-import feed"}
          </button>
        </div>
      </header>

      {importMessage && (
        <p className="ticket-import-message" role="status">{importMessage}</p>
      )}

      <StatsStrip stats={ticketStats.stats} error={ticketStats.error} />
      <TicketFilters filters={filters} onChange={handleFilterChange} onReset={handleReset} />

      <div className="tickets-workspace">
        <TicketQueue
          error={queue.error}
          isLoading={queue.isLoading}
          result={queue.result}
          selectedId={activeTicketId}
          onSelect={setSelectedId}
          onPageChange={handlePageChange}
        />
        <TicketDetail
          detail={ticketDetail.detail}
          error={ticketDetail.error}
          isLoading={ticketDetail.isLoading}
          isSaving={isSaving}
          mutationError={mutationError}
          onReview={handleReview}
        />
      </div>
    </main>
  );
}
