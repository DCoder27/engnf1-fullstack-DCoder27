import { useEffect, useState } from "react";

import { getAdminStats } from "../api/adminApi.js";

export function useAdminStats(token, refreshVersion = 0) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve().then(async () => {
      setError("");
      setIsLoading(true);

      try {
        const response = await getAdminStats({
          token,
          signal: controller.signal,
        });
        setStats(response);
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
  }, [refreshVersion, token]);

  return { error, isLoading, stats };
}
