"use client";

import { DNSRecord } from "../../types/dnsRecord";
import { TableRow, TableCell } from "../ui/Table";

interface DNSRecordRowProps {
  record: DNSRecord;
  selected: boolean;
  onSelect: () => void;
}

export default function DNSRecordRow({
  record,
  selected,
  onSelect,
}: DNSRecordRowProps) {
  // Helper to format ISO dates to readable 'YYYY-MM-DD HH:mm:ss'
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
          name="selectedDNSRecord"
          checked={selected}
          onChange={onSelect}
          className="accent-[#e47911] h-3.5 w-3.5 cursor-pointer"
          aria-label={`Select record ${record.record_name}`}
        />
      </TableCell>

      {/* Record Name */}
      <TableCell className="font-semibold text-zinc-900 font-mono">
        {record.record_name}
      </TableCell>

      {/* Record Type Badge */}
      <TableCell>
        <span className="inline-block px-1.5 py-0.5 rounded-sm border border-zinc-200 bg-zinc-100 text-[10px] font-bold text-zinc-600 uppercase tracking-wide">
          {record.record_type}
        </span>
      </TableCell>

      {/* Value */}
      <TableCell className="text-zinc-600 truncate max-w-sm font-mono text-[11px]">
        {record.value}
      </TableCell>

      {/* TTL */}
      <TableCell className="text-zinc-600">
        {record.ttl}
      </TableCell>

      {/* Priority (MX only, show em-dash for non-priority types) */}
      <TableCell className="text-zinc-600 font-medium">
        {record.record_type === "MX" && record.priority !== null
          ? record.priority
          : "—"}
      </TableCell>

      {/* Created Date */}
      <TableCell className="text-zinc-500 whitespace-nowrap">
        {formatDate(record.created_at)}
      </TableCell>
    </TableRow>
  );
}
