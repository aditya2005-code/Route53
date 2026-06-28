"use client";

import { HostedZone } from "../../types/hostedZone";
import HostedZoneRow from "./HostedZoneRow";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "../ui/Table";

interface HostedZonesTableProps {
  zones: HostedZone[];
  selectedZoneId: number | null;
  onSelectZone: (zone: HostedZone | null) => void;
}

export default function HostedZonesTable({
  zones,
  selectedZoneId,
  onSelectZone,
}: HostedZonesTableProps) {
  return (
    <div className="border border-[#d5dbdb] bg-white rounded-t-sm">
      <Table>
        {/* Table Head */}
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-[#d5dbdb]">
            {/* Blank header column for radio select */}
            <TableHead className="w-10"></TableHead>
            <TableHead className="w-1/3">Domain name</TableHead>
            <TableHead className="w-1/3">Description</TableHead>
            <TableHead className="w-24">Type</TableHead>
            <TableHead className="w-24">Record count</TableHead>
            <TableHead className="w-44">Created date</TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody>
          {zones.map((zone) => (
            <HostedZoneRow
              key={zone.id}
              zone={zone}
              selected={selectedZoneId === zone.id}
              onSelect={() => onSelectZone(selectedZoneId === zone.id ? null : zone)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
