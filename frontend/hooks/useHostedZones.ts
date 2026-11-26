import { useState, useEffect, useCallback } from "react";
import hostedZoneService from "../services/hostedZone.service";
import { HostedZone } from "../types/hostedZone";

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

  // 1. Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // 2. Fetcher
  const fetchHostedZones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await hostedZoneService.getHostedZones(debouncedSearch, page, limit);
      setZones(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const message =
        axiosErr.response?.data?.detail ||
        "Failed to connect to the AWS Route 53 service. Verify the backend host is running.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, limit]);

  // 3. Effect on mount or parameter changes
  useEffect(() => {
    let ignore = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await hostedZoneService.getHostedZones(debouncedSearch, page, limit);
        if (!ignore) {
          setZones(data.items);
          setTotal(data.total);
          setPages(data.pages);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const axiosErr = err as { response?: { data?: { detail?: string } } };
          const message =
            axiosErr.response?.data?.detail ||
            "Failed to connect to the AWS Route 53 service. Verify the backend host is running.";
          setError(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, page, limit]);

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
