"use client";

import { useState } from "react";
import useHostedZones from "../../hooks/useHostedZones";
import { HostedZone } from "../../types/hostedZone";
import HostedZonesTable from "../../components/hosted-zones/HostedZonesTable";
import SearchBar from "../../components/hosted-zones/SearchBar";
import Pagination from "../../components/hosted-zones/Pagination";
import CreateHostedZoneModal from "../../components/hosted-zones/CreateHostedZoneModal";
import EditHostedZoneModal from "../../components/hosted-zones/EditHostedZoneModal";
import DeleteHostedZoneModal from "../../components/hosted-zones/DeleteHostedZoneModal";
import EmptyState from "../../components/hosted-zones/EmptyState";
import LoadingSkeleton from "../../components/hosted-zones/LoadingSkeleton";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Plus, Edit2, Trash2, ShieldAlert } from "lucide-react";

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

  // Selection state (Radio model)
  const [selectedZone, setSelectedZone] = useState<HostedZone | null>(null);

  // Modal display states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Derive currently valid selected zone based on query results
  const effectiveSelectedZone = zones.find((z) => z.id === selectedZone?.id) || null;

  const handleCrudSuccess = () => {
    setSelectedZone(null);
    refetch();
  };

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

        {/* Global Toolbar Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Delete Button (Active only when a row is selected) */}
          <Button
            variant="secondary"
            size="sm"
            disabled={!effectiveSelectedZone || isLoading}
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50/50 disabled:text-zinc-400 disabled:border-[#aab7b7] disabled:hover:bg-white"
            title={effectiveSelectedZone ? `Delete ${effectiveSelectedZone.domain_name}` : "Select a hosted zone to delete"}
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </Button>

          {/* Edit Button (Active only when a row is selected) */}
          <Button
            variant="secondary"
            size="sm"
            disabled={!effectiveSelectedZone || isLoading}
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1"
            title={effectiveSelectedZone ? `Edit ${effectiveSelectedZone.domain_name}` : "Select a hosted zone to edit"}
          >
            <Edit2 size={12} />
            <span>Edit</span>
          </Button>

          {/* Create Hosted Zone Button (Fully functional modal trigger) */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
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
        <EmptyState onCreateClick={() => setIsCreateOpen(true)} />
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
              No matching hosted zones found for &quot;{search}&quot;
            </div>
          ) : (
            <>
              <HostedZonesTable
                zones={zones}
                selectedZoneId={effectiveSelectedZone?.id ?? null}
                onSelectZone={setSelectedZone}
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

      {/* 4. CRUD Modals overlays */}
      <CreateHostedZoneModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCrudSuccess}
      />

      <EditHostedZoneModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleCrudSuccess}
        zone={effectiveSelectedZone}
      />

      <DeleteHostedZoneModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={handleCrudSuccess}
        zone={effectiveSelectedZone}
      />
    </div>
  );
}
