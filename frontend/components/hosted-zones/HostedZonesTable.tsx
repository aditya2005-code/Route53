"use client";

import { HostedZone } from "../../types/hostedZone";
import HostedZoneRow from "./HostedZoneRow";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "../ui/Table";

interface HostedZonesTableProps {
  zones: HostedZone[];
}

export default function HostedZonesTable({ zones }: HostedZonesTableProps) {
  return (
    <div className="border border-[#d5dbdb] bg-white rounded-t-sm">
      <Table>
        {/* Table Head */}
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-[#d5dbdb]">
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
            <HostedZoneRow key={zone.id} zone={zone} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
