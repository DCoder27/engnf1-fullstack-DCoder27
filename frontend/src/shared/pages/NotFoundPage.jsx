import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="page">
      <section className="not-found-card">
        <h1>Page not found</h1>
        <p>The page you requested does not exist.</p>
        <Link to="/">Return to TriageSync</Link>
      </section>
    </main>
  );
}
