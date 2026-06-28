import { useState, useEffect, useCallback } from "react";
import dnsRecordService from "../services/dnsRecord.service";
import { DNSRecord } from "../types/dnsRecord";

/**
 * Custom hook to manage fetching and querying DNS Records under a specific Hosted Zone:
 * - Backend pagination
 * - Backend type filters
 * - Debounced search queries
 * - Loading and error states tracking
 */
export default function useDNSRecords(zoneId: number) {
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  // 1. Debounce search changes by 400ms to reduce database fetch load
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // 2. Reset page to 1 whenever search query or type filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter]);

  // 3. Encapsulate call to dnsRecordService
  const fetchDNSRecords = useCallback(async () => {
    if (!zoneId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await dnsRecordService.getDNSRecords(
        zoneId,
        debouncedSearch,
        typeFilter,
        page,
        limit
      );
      setRecords(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err: any) {
      console.error(`Failed to load DNS records for zone ${zoneId}:`, err);
      const message =
        err.response?.data?.detail ||
        "Failed to load DNS records from backend. Verify service connection.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [zoneId, debouncedSearch, typeFilter, page, limit]);

  // 4. Run retrieval logic on mount or parameter modifications
  useEffect(() => {
    fetchDNSRecords();
  }, [fetchDNSRecords]);

  return {
    records,
    total,
    page,
    pages,
    limit,
    isLoading,
    error,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    setPage,
    refetch: fetchDNSRecords,
  };
}
