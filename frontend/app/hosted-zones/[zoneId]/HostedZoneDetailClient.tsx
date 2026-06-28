"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useDNSRecords from "../../../hooks/useDNSRecords";
import SearchBar from "../../../components/hosted-zones/SearchBar";
import DNSRecordsTable from "../../../components/hosted-zones/DNSRecordsTable";
import Pagination from "../../../components/hosted-zones/Pagination";
import LoadingSkeleton from "../../../components/hosted-zones/LoadingSkeleton";
import CreateDNSRecordModal from "../../../components/hosted-zones/CreateDNSRecordModal";
import EditDNSRecordModal from "../../../components/hosted-zones/EditDNSRecordModal";
import DeleteDNSRecordModal from "../../../components/hosted-zones/DeleteDNSRecordModal";
import { ShieldAlert, RefreshCw, Plus, Edit2, Trash2, ChevronRight, Info } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import hostedZoneService from "../../../services/hostedZone.service";
import { HostedZone } from "../../../types/hostedZone";
import { DNSRecord } from "../../../types/dnsRecord";

interface HostedZoneDetailClientProps {
  zoneId: number;
}

export default function HostedZoneDetailClient({ zoneId }: HostedZoneDetailClientProps) {
  // Hosted Zone Metadata state
  const [zone, setZone] = useState<HostedZone | null>(null);
  const [zoneLoading, setZoneLoading] = useState(true);
  const [zoneError, setZoneError] = useState<string | null>(null);

  // DNS Records state
  const {
    records,
    total,
    page,
    pages,
    isLoading,
    error: recordsError,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    setPage,
    refetch,
  } = useDNSRecords(zoneId);

  // Selection state for records
  const [selectedRecord, setSelectedRecord] = useState<DNSRecord | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Fetch zone metadata on mount
  useEffect(() => {
    async function loadZone() {
      try {
        setZoneLoading(true);
        setZoneError(null);
        const data = await hostedZoneService.getHostedZone(zoneId);
        setZone(data);
      } catch (err: any) {
        console.error("Failed to load hosted zone metadata:", err);
        const msg = err.response?.data?.detail || "Hosted zone details could not be retrieved.";
        setZoneError(msg);
      } finally {
        setZoneLoading(false);
      }
    }
    loadZone();
  }, [zoneId]);

  // Clear selected record row context on filters modification
  useEffect(() => {
    setSelectedRecord(null);
  }, [search, typeFilter, page]);

  const handleCrudSuccess = () => {
    setSelectedRecord(null);
    refetch();
  };

  // Date format helper YYYY-MM-DD HH:MM:SS
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch (e) {
      return dateStr;
    }
  };

  if (zoneLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-zinc-200 animate-pulse rounded-sm" />
        <Card className="p-6 h-28 animate-pulse bg-white" />
        <LoadingSkeleton />
      </div>
    );
  }

  if (zoneError || !zone) {
    return (
      <div className="space-y-4">
        {/* Breadcrumb back navigation */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
          <Link href="/hosted-zones" className="hover:text-[#0066cc] hover:underline">
            Hosted zones
          </Link>
          <ChevronRight size={12} />
          <span className="text-zinc-700">Error loading details</span>
        </div>

        <div className="flex items-start gap-3 border-l-4 border-[#d13212] bg-[#fdf3f2] p-4 text-xs text-[#111111] rounded-sm">
          <ShieldAlert className="text-[#d13212] shrink-0 mt-0.5" size={16} />
          <div>
            <span className="font-bold text-[#d13212]">Retrieval Error</span>
            <p className="mt-1">{zoneError || "The requested hosted zone details could not be loaded."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      
      {/* 1. Breadcrumb navigation */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
        <Link href="/hosted-zones" className="text-[#0066cc] hover:underline">
          Hosted zones
        </Link>
        <ChevronRight size={12} className="text-zinc-400" />
        <span className="text-zinc-700 font-bold">{zone.domain_name}</span>
      </div>

      {/* 2. Page Title Header Panel (AWS Styled) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#d5dbdb] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            {zone.domain_name}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Zone Details and Resource Record Sets
          </p>
        </div>

        {/* DNS CRUD Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh List */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            className="w-9 h-8 p-0"
            title="Refresh records"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </Button>

          {/* Delete Record */}
          <Button
            variant="secondary"
            size="sm"
            disabled={!selectedRecord || isLoading}
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50/50 disabled:text-zinc-400 disabled:border-[#aab7b7] disabled:hover:bg-white"
            title={selectedRecord ? `Delete ${selectedRecord.record_name}` : "Select a record to delete"}
          >
            <Trash2 size={12} />
            <span>Delete record</span>
          </Button>

          {/* Edit Record */}
          <Button
            variant="secondary"
            size="sm"
            disabled={!selectedRecord || isLoading}
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1"
            title={selectedRecord ? `Edit ${selectedRecord.record_name}` : "Select a record to edit"}
          >
            <Edit2 size={12} />
            <span>Edit record</span>
          </Button>

          {/* Create Record */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Create record</span>
          </Button>
        </div>
      </div>

      {/* 3. Hosted Zone Metadata card grid */}
      <Card className="p-4 grid gap-6 sm:grid-cols-2 md:grid-cols-4 text-xs">
        <div className="space-y-1.5">
          <span className="block font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
            Domain name
          </span>
          <span className="font-semibold text-zinc-900 font-mono">{zone.domain_name}</span>
        </div>
        <div className="space-y-1.5">
          <span className="block font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
            Description
          </span>
          <span className="font-medium text-zinc-700 truncate block max-w-full">
            {zone.description || <span className="text-zinc-400">—</span>}
          </span>
        </div>
        <div className="space-y-1.5">
          <span className="block font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
            Created date
          </span>
          <span className="font-semibold text-zinc-600">{formatDateTime(zone.created_at)}</span>
        </div>
        <div className="space-y-1.5">
          <span className="block font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
            Updated date
          </span>
          <span className="font-semibold text-zinc-600">{formatDateTime(zone.updated_at)}</span>
        </div>
      </Card>

      {/* 4. Connection Alert Banner */}
      {recordsError && (
        <div 
          className="flex items-start gap-3 border-l-4 border-[#d13212] bg-[#fdf3f2] p-4 text-xs text-[#111111] rounded-sm"
          role="alert"
        >
          <ShieldAlert className="text-[#d13212] shrink-0 mt-0.5" size={16} />
          <div className="flex flex-col space-y-1">
            <span className="font-bold text-[#d13212]">DNS Retrieval Alert</span>
            <p>{recordsError}</p>
          </div>
        </div>
      )}

      {/* 5. Central DNS Records Grid Card */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : records.length === 0 && !search && !typeFilter ? (
        <div className="flex flex-col items-center justify-center border border-[#d5dbdb] bg-white p-12 text-center rounded-sm space-y-4">
          <Info size={24} className="text-zinc-400" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#111111]">No DNS records</h3>
            <p className="text-xs text-zinc-500">There are no DNS records configured for this hosted zone.</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            Create record
          </Button>
        </div>
      ) : (
        <Card className="flex flex-col">
          {/* Card Top Filtering & Search bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between p-4 border-b border-[#eaeded]">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full max-w-xl">
              {/* SearchBar Filter */}
              <SearchBar value={search} onChange={setSearch} />

              {/* Record Type Dropdown Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 rounded-[3px] border border-[#aab7c4] px-3 text-xs bg-white text-[#111111] outline-none focus:ring-1 focus:ring-[#e47911] focus:border-[#e47911] sm:w-48 cursor-pointer"
                title="Filter by record type"
              >
                <option value="">All record types</option>
                <option value="A">A - IPv4</option>
                <option value="AAAA">AAAA - IPv6</option>
                <option value="CNAME">CNAME - Alias</option>
                <option value="TXT">TXT - Text</option>
                <option value="MX">MX - Mail</option>
                <option value="NS">NS - Name server</option>
                <option value="PTR">PTR - Pointer</option>
                <option value="SRV">SRV - Service</option>
                <option value="CAA">CAA - Authority</option>
              </select>
            </div>

            {/* Total Results Summary */}
            <div className="text-xs text-zinc-500 font-medium whitespace-nowrap">
              Record sets ({total})
            </div>
          </div>

          {/* Card Table View */}
          {records.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 font-medium">
              No matching DNS records found for search queries.
            </div>
          ) : (
            <>
              <DNSRecordsTable
                records={records}
                selectedRecordId={selectedRecord?.id ?? null}
                onSelectRecord={setSelectedRecord}
              />

              {/* Card Footer Navigation bar */}
              {pages > 1 && (
                <Pagination
                  page={page}
                  pages={pages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </Card>
      )}

      {/* 6. CRUD Modal overlays */}
      <CreateDNSRecordModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCrudSuccess}
        zoneId={zoneId}
      />

      <EditDNSRecordModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleCrudSuccess}
        zoneId={zoneId}
        record={selectedRecord}
      />

      <DeleteDNSRecordModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={handleCrudSuccess}
        zoneId={zoneId}
        record={selectedRecord}
      />
    </div>
  );
}
