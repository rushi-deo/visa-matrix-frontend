import { useEffect, useState } from "react";
import { getAllCountries } from "../services/countryService";

export function useCountries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCountries = async () => {
      setLoading(true);
      setError("");

      try {
        const nextCountries = await getAllCountries();

        if (isMounted) {
          setCountries(nextCountries);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message ?? "Failed to load countries.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  return { countries, loading, error };
}
