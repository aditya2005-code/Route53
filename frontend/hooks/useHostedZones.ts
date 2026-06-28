import { useState, useEffect, useCallback } from "react";
import hostedZoneService from "../services/hostedZone.service";
import { HostedZone } from "../types/hostedZone";

/**
 * Custom hook to manage fetching and querying Hosted Zones with:
 * - Backend pagination
 * - Debounced API searches
 * - State tracking (loading, errors, values)
 */
export default function useHostedZones() {
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // 1. Debounce logic: Delay setting debouncedSearch until typing halts for 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // 2. Reset page to 1 whenever search query updates
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // 3. Encapsulate call to hostedZoneService inside a useCallback hook
  const fetchHostedZones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await hostedZoneService.getHostedZones(debouncedSearch, page, limit);
      setZones(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err: any) {
      console.error("Failed to load hosted zones:", err);
      const message =
        err.response?.data?.detail ||
        "Failed to connect to the AWS Route 53 service. Verify the backend host is running.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, limit]);

  // 4. Run retrieval logic on mount or parameter modifications
  useEffect(() => {
    fetchHostedZones();
  }, [fetchHostedZones]);

  return {
    zones,
    total,
    page,
    pages,
    limit,
    isLoading,
    error,
    search,
    setSearch,
    setPage,
    refetch: fetchHostedZones,
  };
}
