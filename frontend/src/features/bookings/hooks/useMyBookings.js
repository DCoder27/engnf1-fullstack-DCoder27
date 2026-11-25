import { useEffect, useState } from "react";

import { getMyBookings } from "../api/bookingApi.js";

const EMPTY_RESULT = {
  data: [],
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
};

export function useMyBookings({ page, refreshVersion, status, token }) {
  const [result, setResult] = useState(EMPTY_RESULT);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve().then(async () => {
      setError("");
      setIsLoading(true);

      try {
        const response = await getMyBookings({
          page,
          status,
          token,
          signal: controller.signal,
        });
        setResult(response);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    });

    return () => controller.abort();
  }, [page, refreshVersion, status, token]);

  return { error, isLoading, result };
}
