"use client";

import useHostedZones from "../../hooks/useHostedZones";
import SearchBar from "../../components/hosted-zones/SearchBar";
import HostedZonesTable from "../../components/hosted-zones/HostedZonesTable";
import Pagination from "../../components/hosted-zones/Pagination";
import EmptyState from "../../components/hosted-zones/EmptyState";
import LoadingSkeleton from "../../components/hosted-zones/LoadingSkeleton";
import { ShieldAlert, RefreshCw, Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export default function HostedZonesPage() {
  const {
    zones,
    total,
    page,
    pages,
    isLoading,
    error,
    search,
    setSearch,
    setPage,
    refetch,
  } = useHostedZones();

  return (
    <div className="space-y-6 select-none">
      {/* 1. Page Title Header Panel (AWS Styled) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Hosted zones
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            A hosted zone is a container for DNS records. Create a hosted zone for each domain you want to route traffic for.
          </p>
        </div>

        {/* Action Controls using Button primitives */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            className="w-9 h-8 p-0"
            title="Refresh list"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </Button>

          {/* Create Hosted Zone Button (Disabled in this phase as requested) */}
          <Button
            variant="primary"
            size="sm"
            disabled
            title="Create Hosted Zone is disabled in this phase"
            className="flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Create hosted zone</span>
          </Button>
        </div>
      </div>

      {/* 2. Error Message Banner */}
      {error && (
        <div 
          className="flex items-start gap-3 border-l-4 border-[#d13212] bg-[#fdf3f2] p-4 text-xs text-[#111111] rounded-sm"
          role="alert"
        >
          <ShieldAlert className="text-[#d13212] shrink-0 mt-0.5" size={16} />
          <div className="flex flex-col space-y-1">
            <span className="font-bold text-[#d13212]">Connection Alert</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* 3. Main Data Card Layout using Card primitive */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : zones.length === 0 && !search ? (
        <EmptyState />
      ) : (
        <Card className="flex flex-col">
          {/* Card Top Filtering bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between p-4 border-b border-[#eaeded]">
            <SearchBar value={search} onChange={setSearch} />
            
            {/* Total Results Summary */}
            <div className="text-xs text-zinc-500 font-medium">
              Hosted zones ({total})
            </div>
          </div>

          {/* Card Central Content Block */}
          {zones.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 font-medium">
              No matching hosted zones found for "{search}"
            </div>
          ) : (
            <>
              <HostedZonesTable zones={zones} />
              
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
    </div>
  );
}
