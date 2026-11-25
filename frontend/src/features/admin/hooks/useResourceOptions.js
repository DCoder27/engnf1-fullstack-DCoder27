import { useEffect, useState } from "react";

import { getResources } from "../api/adminApi.js";

export function useResourceOptions(token) {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    getResources({
      filters: { search: "", type: "" },
      page: 1,
      token,
      signal: controller.signal,
    })
      .then((response) => setResources(response.data))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setResources([]);
        }
      });

    return () => controller.abort();
  }, [token]);

  return resources;
}
