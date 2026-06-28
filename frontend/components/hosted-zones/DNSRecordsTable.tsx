"use client";

import { DNSRecord } from "../../types/dnsRecord";
import DNSRecordRow from "./DNSRecordRow";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "../ui/Table";

interface DNSRecordsTableProps {
  records: DNSRecord[];
  selectedRecordId: number | null;
  onSelectRecord: (record: DNSRecord | null) => void;
}

export default function DNSRecordsTable({
  records,
  selectedRecordId,
  onSelectRecord,
}: DNSRecordsTableProps) {
  return (
    <div className="border border-[#d5dbdb] bg-white rounded-t-sm">
      <Table>
        {/* Table Head */}
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-[#d5dbdb]">
            <TableHead className="w-10"></TableHead>
            <TableHead className="w-1/4">Record name</TableHead>
            <TableHead className="w-20">Type</TableHead>
            <TableHead className="w-1/3">Value</TableHead>
            <TableHead className="w-24">TTL (seconds)</TableHead>
            <TableHead className="w-20">Priority</TableHead>
            <TableHead className="w-40">Created date</TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody>
          {records.map((record) => (
            <DNSRecordRow
              key={record.id}
              record={record}
              selected={selectedRecordId === record.id}
              onSelect={() => onSelectRecord(selectedRecordId === record.id ? null : record)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
