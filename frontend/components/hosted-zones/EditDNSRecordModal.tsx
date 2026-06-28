"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, ShieldAlert } from "lucide-react";
import { DNSRecord } from "../../types/dnsRecord";
import dnsRecordService from "../../services/dnsRecord.service";
import useToast from "../../hooks/useToast";
import { Button } from "../ui/Button";

interface EditDNSRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  zoneId: number;
  record: DNSRecord | null;
}

// Zod Schema with preprocess and cross-field refinements for MX priority
const dnsSchema = z
  .object({
    record_name: z
      .string()
      .min(1, "Record name is required")
      .max(255, "Record name cannot exceed 255 characters"),
    record_type: z.enum(["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"]),
    value: z
      .string()
      .min(1, "Value is required")
      .max(1024, "Value cannot exceed 1024 characters"),
    ttl: z
      .number()
      .int()
      .min(60, "TTL must be at least 60 seconds")
      .max(86400, "TTL cannot exceed 86400 seconds (24 hours)"),
    priority: z.preprocess(
      (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? undefined : Number(val)),
      z.number().int().min(0, "Priority must be at least 0").max(65535, "Priority cannot exceed 65535").optional()
    ),
  })
  .superRefine((data, ctx) => {
    // Priority check strictly for MX records
    if (
      data.record_type === "MX" &&
      (data.priority === undefined || data.priority === null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Priority is required for MX records",
        path: ["priority"],
      });
    }
  });

type EditFormValues = z.infer<typeof dnsSchema>;

export default function EditDNSRecordModal({
  isOpen,
  onClose,
  onSuccess,
  zoneId,
  record,
}: EditDNSRecordModalProps) {
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(dnsSchema) as any,
  });

  // Watch the selected record type to toggle priority conditional inputs
  const selectedType = watch("record_type");

  // Pre-fill existing values whenever record updates or modal opens
  useEffect(() => {
    if (isOpen && record) {
      reset({
        record_name: record.record_name,
        record_type: record.record_type,
        value: record.value,
        ttl: record.ttl,
        priority: record.priority !== null ? record.priority : undefined,
      });
    }
  }, [isOpen, record, reset]);

  if (!isOpen || !record) return null;

  const onSubmit = async (data: EditFormValues) => {
    // Sanitize payload parameters: set priority to null for non-MX types to satisfy API checks
    const payload = {
      record_name: data.record_name,
      record_type: data.record_type,
      value: data.value,
      ttl: data.ttl,
      priority: data.record_type === "MX" && data.priority !== undefined ? Number(data.priority) : null,
    };

    try {
      await dnsRecordService.updateDNSRecord(zoneId, record.id, payload);
      showToast("DNS Record updated successfully.", "success");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Update DNS record failed:", err);
      const msg = err.response?.data?.detail || "Failed to update DNS record. Please check inputs.";
      showToast(msg, "error");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-record-title"
    >
      {/* Modal Box */}
      <div className="w-full max-w-[480px] bg-white border border-[#d5dbdb] shadow-xl rounded-sm flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#eaeded] px-6 py-4">
          <h2 id="edit-record-title" className="text-sm font-bold text-[#111111]">
            Edit record: {record.record_name} ({record.record_type})
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-zinc-400 hover:text-zinc-600 disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="p-6 space-y-4 text-xs text-[#111111]">
            
            {/* Record Name */}
            <div className="space-y-1">
              <label 
                htmlFor="edit-dns-record-name" 
                className="block font-bold text-zinc-700"
              >
                Record name
              </label>
              <input
                {...register("record_name")}
                id="edit-dns-record-name"
                type="text"
                disabled={isSubmitting}
                aria-invalid={errors.record_name ? "true" : "false"}
                aria-describedby={errors.record_name ? "edit-dns-name-error" : undefined}
                className={`h-9 w-full rounded-[3px] border px-3 text-xs bg-white text-[#111111] transition-all outline-none focus:ring-1 focus:ring-[#e47911] focus:border-[#e47911] disabled:bg-zinc-50 disabled:text-zinc-500 ${
                  errors.record_name ? "border-[#d13212]" : "border-[#aab7c4]"
                }`}
              />
              {errors.record_name && (
                <span 
                  id="edit-dns-name-error" 
                  className="mt-1 flex items-center gap-1 font-semibold text-[#d13212]"
                  role="alert"
                >
                  <ShieldAlert size={12} /> {errors.record_name.message}
                </span>
              )}
            </div>

            {/* Record Type Dropdown */}
            <div className="space-y-1">
              <label 
                htmlFor="edit-dns-record-type" 
                className="block font-bold text-zinc-700"
              >
                Record type
              </label>
              <select
                {...register("record_type")}
                id="edit-dns-record-type"
                disabled={isSubmitting}
                className="h-9 w-full rounded-[3px] border border-[#aab7c4] px-3 text-xs bg-white text-[#111111] outline-none focus:ring-1 focus:ring-[#e47911] focus:border-[#e47911] disabled:bg-zinc-50"
              >
                <option value="A">A - Routes traffic to IPv4</option>
                <option value="AAAA">AAAA - Routes traffic to IPv6</option>
                <option value="CNAME">CNAME - Canonical name alias</option>
                <option value="TXT">TXT - Arbitrary text field</option>
                <option value="MX">MX - Mail exchange server</option>
                <option value="NS">NS - Name server</option>
                <option value="PTR">PTR - Pointer lookup</option>
                <option value="SRV">SRV - Service location</option>
                <option value="CAA">CAA - Certificate authority</option>
              </select>
            </div>

            {/* Value / Route Target */}
            <div className="space-y-1">
              <label 
                htmlFor="edit-dns-record-value" 
                className="block font-bold text-zinc-700"
              >
                Value
              </label>
              <textarea
                {...register("value")}
                id="edit-dns-record-value"
                rows={3}
                disabled={isSubmitting}
                aria-invalid={errors.value ? "true" : "false"}
                aria-describedby={errors.value ? "edit-dns-value-error" : undefined}
                className={`w-full rounded-[3px] border p-3 text-xs bg-white text-[#111111] transition-all outline-none focus:ring-1 focus:ring-[#e47911] focus:border-[#e47911] disabled:bg-zinc-50 disabled:text-zinc-500 ${
                  errors.value ? "border-[#d13212]" : "border-[#aab7c4]"
                }`}
              />
              {errors.value && (
                <span 
                  id="edit-dns-value-error" 
                  className="mt-1 flex items-center gap-1 font-semibold text-[#d13212]"
                  role="alert"
                >
                  <ShieldAlert size={12} /> {errors.value.message}
                </span>
              )}
            </div>

            {/* TTL Section */}
            <div className="space-y-1">
              <label 
                htmlFor="edit-dns-record-ttl" 
                className="block font-bold text-zinc-700"
              >
                TTL (Seconds)
              </label>
              <input
                {...register("ttl", { valueAsNumber: true })}
                id="edit-dns-record-ttl"
                type="number"
                disabled={isSubmitting}
                aria-invalid={errors.ttl ? "true" : "false"}
                aria-describedby={errors.ttl ? "edit-dns-ttl-error" : undefined}
                className={`h-9 w-full rounded-[3px] border px-3 text-xs bg-white text-[#111111] transition-all outline-none focus:ring-1 focus:ring-[#e47911] focus:border-[#e47911] disabled:bg-zinc-50 disabled:text-zinc-500 ${
                  errors.ttl ? "border-[#d13212]" : "border-[#aab7c4]"
                }`}
              />
              {errors.ttl && (
                <span 
                  id="edit-dns-ttl-error" 
                  className="mt-1 flex items-center gap-1 font-semibold text-[#d13212]"
                  role="alert"
                >
                  <ShieldAlert size={12} /> {errors.ttl.message}
                </span>
              )}
            </div>

            {/* Conditional MX Priority Input (Visible only when selectedType == MX) */}
            {selectedType === "MX" && (
              <div className="space-y-1">
                <label 
                  htmlFor="edit-dns-record-priority" 
                  className="block font-bold text-zinc-700"
                >
                  Priority
                </label>
                <input
                  {...register("priority", { valueAsNumber: true })}
                  id="edit-dns-record-priority"
                  type="number"
                  placeholder="e.g. 10 (highest), 20"
                  disabled={isSubmitting}
                  aria-invalid={errors.priority ? "true" : "false"}
                  aria-describedby={errors.priority ? "edit-dns-priority-error" : undefined}
                  className={`h-9 w-full rounded-[3px] border px-3 text-xs bg-white text-[#111111] transition-all outline-none focus:ring-1 focus:ring-[#e47911] focus:border-[#e47911] disabled:bg-zinc-50 disabled:text-zinc-500 ${
                    errors.priority ? "border-[#d13212]" : "border-[#aab7c4]"
                  }`}
                />
                {errors.priority && (
                  <span 
                    id="edit-dns-priority-error" 
                    className="mt-1 flex items-center gap-1 font-semibold text-[#d13212]"
                    role="alert"
                  >
                    <ShieldAlert size={12} /> {errors.priority.message}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer / Actions */}
          <div className="flex justify-end gap-2 border-t border-[#eaeded] bg-[#f2f3f3] px-6 py-3 rounded-b-sm">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
