"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { DNSRecord } from "../../types/dnsRecord";
import dnsRecordService from "../../services/dnsRecord.service";
import useToast from "../../hooks/useToast";
import { Button } from "../ui/Button";

interface DeleteDNSRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  zoneId: number;
  record: DNSRecord | null;
}

export default function DeleteDNSRecordModal({
  isOpen,
  onClose,
  onSuccess,
  zoneId,
  record,
}: DeleteDNSRecordModalProps) {
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !record) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dnsRecordService.deleteDNSRecord(zoneId, record.id);
      showToast("DNS Record deleted successfully.", "success");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Delete DNS record failed:", err);
      const msg = err.response?.data?.detail || "Failed to delete DNS record. Please try again.";
      showToast(msg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-record-title"
    >
      {/* Modal Box */}
      <div className="w-full max-w-[440px] bg-white border border-[#d5dbdb] shadow-xl rounded-sm flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#eaeded] px-6 py-4">
          <h2 id="delete-record-title" className="text-sm font-bold text-[#d13212] flex items-center gap-1.5">
            <AlertTriangle size={16} />
            Delete DNS record
          </h2>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-zinc-400 hover:text-zinc-600 disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-3 text-xs text-[#111111] leading-relaxed">
          <p className="font-bold">
            Are you sure you want to delete this DNS record?
          </p>
          <div className="border border-red-100 bg-red-50/40 p-3 text-zinc-700 space-y-1.5 rounded-sm">
            <div>
              <span className="font-bold text-zinc-900">Record name:</span>{" "}
              <span className="font-mono bg-white px-1.5 py-0.5 border border-zinc-200 rounded-sm">{record.record_name}</span>
            </div>
            <div>
              <span className="font-bold text-zinc-900">Record type:</span>{" "}
              <span className="font-mono bg-white px-1.5 py-0.5 border border-zinc-200 rounded-sm">{record.record_type}</span>
            </div>
            <div>
              <span className="font-bold text-zinc-900">Value:</span>{" "}
              <span className="font-mono bg-white px-1.5 py-0.5 border border-zinc-200 rounded-sm truncate block max-w-full">{record.value}</span>
            </div>
          </div>
          <p className="text-zinc-500">
            <span className="font-bold text-[#d13212]">Warning:</span> This action cannot be undone. DNS resolvers around the world will stop routing traffic to this value once caches expire.
          </p>
        </div>

        {/* Modal Footer / Actions */}
        <div className="flex justify-end gap-2 border-t border-[#eaeded] bg-[#f2f3f3] px-6 py-3 rounded-b-sm">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
