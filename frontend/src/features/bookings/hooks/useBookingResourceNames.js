import { useEffect, useState } from "react";

import { getResources } from "../../resources/api/resourceApi.js";

export function useBookingResourceNames(token) {
  const [resourceNames, setResourceNames] = useState(new Map());

  useEffect(() => {
    const controller = new AbortController();

    getResources({
      filters: { search: "", type: "", minCapacity: "" },
      page: 1,
      token,
      signal: controller.signal,
    })
      .then((result) => {
        setResourceNames(
          new Map(result.data.map((resource) => [resource.id, resource.name])),
        );
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setResourceNames(new Map());
        }
      });

    return () => controller.abort();
  }, [token]);

  return resourceNames;
}
