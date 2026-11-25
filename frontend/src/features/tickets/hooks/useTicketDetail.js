import { useEffect, useState } from "react";

import { getTicket } from "../api/ticketApi.js";

export function useTicketDetail({ ticketId, token }) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ticketId) {
      return undefined;
    }

    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        setIsLoading(true);
        setError("");
      }
    });

    getTicket({ ticketId, token, signal: controller.signal })
      .then(setDetail)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [ticketId, token]);

  return {
    detail: ticketId ? detail : null,
    error: ticketId ? error : "",
    isLoading: ticketId ? isLoading : false,
    setDetail,
  };
}
