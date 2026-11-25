import { useAuth } from "../../features/auth/hooks/useAuth.js";

export function HomePage() {
  const { user } = useAuth();

  return (
    <main className="page">
      <section className="welcome-card">
        <h1>Welcome, {user.name}</h1>
        <p>
          Authentication is ready. Ticket triage, resources, and bookings will
          be added feature by feature.
        </p>
      </section>
    </main>
  );
}
