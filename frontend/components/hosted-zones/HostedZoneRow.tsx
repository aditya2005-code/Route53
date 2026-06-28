"use client";

import { HostedZone } from "../../types/hostedZone";
import { TableRow, TableCell } from "../ui/Table";

interface HostedZoneRowProps {
  zone: HostedZone;
}

export default function HostedZoneRow({ zone }: HostedZoneRowProps) {
  // Helper to format ISO dates to readable 'YYYY-MM-DD HH:mm:ss' format
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const pad = (num: number) => String(num).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <TableRow>
      {/* Domain Name (Plain Text as requested, details page does not exist yet) */}
      <TableCell className="font-bold text-zinc-900">
        {zone.domain_name}
      </TableCell>

      {/* Description */}
      <TableCell className="text-zinc-600 truncate max-w-xs">
        {zone.description || <span className="text-zinc-400">-</span>}
      </TableCell>

      {/* Type (Default to Public) */}
      <TableCell>
        <span className="inline-block px-1.5 py-0.5 rounded-sm border border-zinc-200 bg-zinc-100 text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
          Public
        </span>
      </TableCell>

      {/* Record Count: display backend value if available, else '—' (not hardcoded to 2) */}
      <TableCell className="text-zinc-700">
        {zone.record_count !== undefined ? zone.record_count : "—"}
      </TableCell>

      {/* Created Date */}
      <TableCell className="text-zinc-500 whitespace-nowrap">
        {formatDate(zone.created_at)}
      </TableCell>
    </TableRow>
  );
}
