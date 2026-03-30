import { useEffect, useState } from "react";

export function useHrResource(fetcher, dependencies = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetcher();
      setData(response);
    } catch (loadError) {
      setError(loadError.message ?? "Unable to load HR resource.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, error, loading, reload: load, setData };
}

