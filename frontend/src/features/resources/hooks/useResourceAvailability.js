import { useEffect, useRef, useState } from "react";

import { getResourceAvailability } from "../api/resourceApi.js";

export function useResourceAvailability(token) {
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const controllerRef = useRef(null);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const checkAvailability = async ({ resourceId, from, to }) => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setAvailability(null);
    setError("");
    setIsLoading(true);

    try {
      const result = await getResourceAvailability({
        resourceId,
        from,
        to,
        token,
        signal: controllerRef.current.signal,
      });
      setAvailability(result);
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError(requestError.message);
      }
    } finally {
      if (!controllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  const clearAvailability = () => {
    controllerRef.current?.abort();
    setAvailability(null);
    setError("");
    setIsLoading(false);
  };

  return {
    availability,
    checkAvailability,
    clearAvailability,
    error,
    isLoading,
  };
}
