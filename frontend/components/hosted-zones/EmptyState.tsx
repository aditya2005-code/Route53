"use client";

import { Info } from "lucide-react";
import { Button } from "../ui/Button";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center border border-[#d5dbdb] bg-white p-12 text-center rounded-sm space-y-6">
      {/* Information Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
        <Info size={24} />
      </div>

      {/* Helper Context */}
      <div className="max-w-md space-y-2">
        <h3 className="text-base font-bold text-[#111111]">
          No hosted zones
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed">
          You do not have any hosted zones. A hosted zone represents a collection of records that can be managed together, authoritatively responding to DNS queries for a domain.
        </p>
      </div>

      {/* Reusable Button UI Primitive (Disabled in this phase as requested) */}
      <Button
        variant="primary"
        disabled
        title="Create Hosted Zone is disabled in this phase"
      >
        Create hosted zone
      </Button>
    </div>
  );
}
