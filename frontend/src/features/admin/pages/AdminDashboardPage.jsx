import { useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth.js";
import { AdminSummary } from "../components/AdminSummary.jsx";
import { BookingManager } from "../components/BookingManager.jsx";
import { BookingStatusPanel } from "../components/BookingStatusPanel.jsx";
import { ResourceManager } from "../components/ResourceManager.jsx";
import { TicketInsightsPanel } from "../components/TicketInsightsPanel.jsx";
import { TopResourcesPanel } from "../components/TopResourcesPanel.jsx";
import { useAdminStats } from "../hooks/useAdminStats.js";
import "../styles/admin.css";

export function AdminDashboardPage() {
  const { accessToken, user } = useAuth();
  const [statsVersion, setStatsVersion] = useState(0);
  const { error, isLoading, stats } = useAdminStats(accessToken, statsVersion);

  return (
    <main className="page admin-page">
      <header className="admin-hero">
        <div>
          <span className="admin-hero__eyebrow">Operations control</span>
          <h1>Good morning, {user.name.split(" ")[0]}.</h1>
          <p>Monitor ticket quality, resource demand, and booking activity from one place.</p>
        </div>
        <div className="admin-hero__access">
          <span>Access level</span>
          <strong>Administrator</strong>
        </div>
      </header>

      {isLoading && <div className="admin-state">Loading operational data…</div>}
      {!isLoading && error && (
        <div className="admin-state admin-state--error">
          <strong>Dashboard unavailable</strong>
          <span>{error}</span>
        </div>
      )}
      {!isLoading && stats && (
        <>
          <AdminSummary stats={stats} />
          <div className="admin-grid">
            <BookingStatusPanel counts={stats.bookingsByStatus} />
            <TopResourcesPanel resources={stats.topResources} />
            <TicketInsightsPanel ticketStats={stats.ticketStats} />
          </div>
          <ResourceManager
            token={accessToken}
            onResourceChange={() => setStatsVersion((version) => version + 1)}
          />
          <BookingManager
            token={accessToken}
            onBookingChange={() => setStatsVersion((version) => version + 1)}
          />
        </>
      )}
    </main>
  );
}
