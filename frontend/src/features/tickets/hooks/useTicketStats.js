import { useEffect, useState } from "react";

import { getTicketStats } from "../api/ticketApi.js";

export function useTicketStats({ refreshVersion, token }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        setError("");
      }
    });

    getTicketStats({ token, signal: controller.signal })
      .then(setStats)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      });

    return () => controller.abort();
  }, [refreshVersion, token]);

  return { error, stats };
}
