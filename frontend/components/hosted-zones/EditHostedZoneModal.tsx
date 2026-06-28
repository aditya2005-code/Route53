"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, ShieldAlert } from "lucide-react";
import { HostedZone } from "../../types/hostedZone";
import hostedZoneService from "../../services/hostedZone.service";
import useToast from "../../hooks/useToast";
import { Button } from "../ui/Button";

interface EditHostedZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  zone: HostedZone | null;
}

// RFC-1123 Domain regex validator matching backend logic
const domainPattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

const editSchema = z.object({
  domain_name: z
    .string()
    .min(4, "Domain name must be at least 4 characters")
    .max(255, "Domain name cannot exceed 255 characters")
    .regex(domainPattern, "Enter a valid domain name, e.g. 'example.com'"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

type EditFormValues = z.infer<typeof editSchema>;

export default function EditHostedZoneModal({
  isOpen,
  onClose,
  onSuccess,
  zone,
}: EditHostedZoneModalProps) {
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  // Pre-fill existing values whenever zone updates or modal opens
  useEffect(() => {
    if (isOpen && zone) {
      reset({
        domain_name: zone.domain_name,
        description: zone.description || "",
      });
    }
  }, [isOpen, zone, reset]);

  if (!isOpen || !zone) return null;

  const onSubmit = async (data: EditFormValues) => {
    try {
      await hostedZoneService.updateHostedZone(zone.id, data.domain_name, data.description);
      showToast("Hosted Zone updated successfully.", "success");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Update hosted zone failed:", err);
      const msg = err.response?.data?.detail || "Failed to update hosted zone. Please try again.";
      showToast(msg, "error");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-zone-title"
    >
      {/* Modal Box */}
      <div className="w-full max-w-[480px] bg-white border border-[#d5dbdb] shadow-xl rounded-sm flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#eaeded] px-6 py-4">
          <h2 id="edit-zone-title" className="text-sm font-bold text-[#111111]">
            Edit hosted zone: {zone.domain_name}
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
            
            {/* Domain Name Field */}
            <div className="space-y-1">
              <label 
                htmlFor="edit-domain-name" 
                className="block font-bold text-zinc-700"
              >
                Domain name
              </label>
              <input
                {...register("domain_name")}
                id="edit-domain-name"
                type="text"
                disabled={isSubmitting}
                aria-invalid={errors.domain_name ? "true" : "false"}
                aria-describedby={errors.domain_name ? "edit-domain-error" : undefined}
                className={`h-9 w-full rounded-[3px] border px-3 text-xs bg-white text-[#111111] transition-all outline-none focus:ring-1 focus:ring-[#e47911] focus:border-[#e47911] disabled:bg-zinc-50 disabled:text-zinc-500 ${
                  errors.domain_name ? "border-[#d13212]" : "border-[#aab7c4]"
                }`}
              />
              {errors.domain_name && (
                <span 
                  id="edit-domain-error" 
                  className="mt-1 flex items-center gap-1 font-semibold text-[#d13212]"
                  role="alert"
                >
                  <ShieldAlert size={12} /> {errors.domain_name.message}
                </span>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-1">
              <label 
                htmlFor="edit-description" 
                className="block font-bold text-zinc-700"
              >
                Description
              </label>
              <textarea
                {...register("description")}
                id="edit-description"
                rows={3}
                disabled={isSubmitting}
                aria-invalid={errors.description ? "true" : "false"}
                aria-describedby={errors.description ? "edit-description-error" : undefined}
                className={`w-full rounded-[3px] border p-3 text-xs bg-white text-[#111111] transition-all outline-none focus:ring-1 focus:ring-[#e47911] focus:border-[#e47911] disabled:bg-zinc-50 disabled:text-zinc-500 ${
                  errors.description ? "border-[#d13212]" : "border-[#aab7c4]"
                }`}
              />
              {errors.description && (
                <span 
                  id="edit-description-error" 
                  className="mt-1 flex items-center gap-1 font-semibold text-[#d13212]"
                  role="alert"
                >
                  <ShieldAlert size={12} /> {errors.description.message}
                </span>
              )}
            </div>
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
