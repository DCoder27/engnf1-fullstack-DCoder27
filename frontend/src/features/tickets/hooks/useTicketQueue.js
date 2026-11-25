import { useCallback, useEffect, useState } from "react";

import { getTickets } from "../api/ticketApi.js";

const EMPTY_RESULT = {
  data: [],
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
};

export function useTicketQueue({ filters, page, token }) {
  const [result, setResult] = useState(EMPTY_RESULT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);

  const { category, priority, q, status } = filters;

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        setIsLoading(true);
        setError("");
      }
    });

    getTickets({
      filters: { category, priority, q, status },
      page,
      token,
      signal: controller.signal,
    })
      .then(setResult)
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
  }, [category, page, priority, q, reloadVersion, status, token]);

  const replaceTicket = useCallback((ticket) => {
    setResult((current) => ({
      ...current,
      data: current.data.map((item) => (item.id === ticket.id ? ticket : item)),
    }));
  }, []);

  const reload = useCallback(() => {
    setReloadVersion((version) => version + 1);
  }, []);

  return { error, isLoading, reload, replaceTicket, result };
}
