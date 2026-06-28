"use client";

import { HostedZone } from "../../types/hostedZone";
import { TableRow, TableCell } from "../ui/Table";

interface HostedZoneRowProps {
  zone: HostedZone;
  selected: boolean;
  onSelect: () => void;
}

export default function HostedZoneRow({ zone, selected, onSelect }: HostedZoneRowProps) {
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
    <TableRow 
      className={`cursor-pointer ${selected ? "bg-zinc-50" : ""}`}
      onClick={onSelect}
    >
      {/* Radio Selection cell */}
      <TableCell className="w-10 text-center" onClick={(e) => e.stopPropagation()}>
        <input
          type="radio"
          name="selectedHostedZone"
          checked={selected}
          onChange={onSelect}
          className="accent-[#e47911] h-3.5 w-3.5 cursor-pointer"
          aria-label={`Select ${zone.domain_name}`}
        />
      </TableCell>

      {/* Domain Name */}
      <TableCell className="font-bold text-zinc-900">
        {zone.domain_name}
      </TableCell>

      {/* Description */}
      <TableCell className="text-zinc-600 truncate max-w-xs">
        {zone.description || <span className="text-zinc-400">-</span>}
      </TableCell>

      {/* Type */}
      <TableCell>
        <span className="inline-block px-1.5 py-0.5 rounded-sm border border-zinc-200 bg-zinc-100 text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
          Public
        </span>
      </TableCell>

      {/* Record Count */}
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
