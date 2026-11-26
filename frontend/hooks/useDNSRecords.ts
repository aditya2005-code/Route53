import { useState, useEffect, useCallback } from "react";
import dnsRecordService from "../services/dnsRecord.service";
import { DNSRecord, RecordType } from "../types/dnsRecord";

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
  const [typeFilter, setTypeFilter] = useState<RecordType | "">("");

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

  // 2. Encapsulate call to dnsRecordService
  const fetchDNSRecords = useCallback(async () => {
    if (!zoneId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await dnsRecordService.getDNSRecords(
        zoneId,
        debouncedSearch,
        typeFilter || undefined,
        page,
        limit
      );
      setRecords(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const message =
        axiosErr.response?.data?.detail ||
        "Failed to load DNS records from backend. Verify service connection.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [zoneId, debouncedSearch, typeFilter, page, limit]);

  // 3. Effect on mount or parameter changes
  useEffect(() => {
    if (!zoneId) return;
    let ignore = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await dnsRecordService.getDNSRecords(
          zoneId,
          debouncedSearch,
          typeFilter || undefined,
          page,
          limit
        );
        if (!ignore) {
          setRecords(data.items);
          setTotal(data.total);
          setPages(data.pages);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const axiosErr = err as { response?: { data?: { detail?: string } } };
          const message =
            axiosErr.response?.data?.detail ||
            "Failed to load DNS records from backend. Verify service connection.";
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
  }, [zoneId, debouncedSearch, typeFilter, page, limit]);

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
    setTypeFilter: (newFilter: RecordType | "") => {
      setTypeFilter(newFilter);
      setPage(1);
    },
    setPage,
    refetch: fetchDNSRecords,
  };
}
