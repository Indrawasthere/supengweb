"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type TicketRow = {
  id: number;
  title: string;
  requester: string;
  requesterEmail?: string;
  assignedToTechnician: string;
  assignedToTechnicianGroup: string;
  status: string;
  priority: string;
  openingDate: string;
  lastUpdate: string;
  closingDate?: string;
  urgency?: string;
  impact?: string;
  category?: string;
  location?: string;
  progressPercent?: number;
  description?: string;
};

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s.includes("processing") || s.includes("assigned"))
    return <Badge variant="default">{status}</Badge>;
  if (s.includes("waiting")) return <Badge variant="secondary">{status}</Badge>;
  if (s.includes("resolved")) return <Badge variant="outline">{status}</Badge>;
  if (s.includes("closed")) return <Badge variant="outline">{status}</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

export function TicketTable({ rows }: { rows: TicketRow[] }) {
  const [q, setQ] = React.useState("");
  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((r) => {
      return (
        r.id.toString().includes(query) ||
        r.title.toLowerCase().includes(query) ||
        r.requester.toLowerCase().includes(query) ||
        r.assignedToTechnician.toLowerCase().includes(query) ||
        r.assignedToTechnicianGroup.toLowerCase().includes(query)
      );
    });
  }, [q, rows]);

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            Ongoing tickets assigned to your L2 team
          </div>
          <div className="mt-1 text-lg font-semibold">Ticket List</div>
        </div>
        <div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ticket / requester / assignee..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm outline-none ring-0 focus:border-primary"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[90px]">ID</TableHead>
            <TableHead>Case</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="w-[150px]">Last Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.id}</TableCell>
              <TableCell>
                <div className="min-w-[260px] max-w-[360px]">
                  <div className="truncate font-medium">{r.title}</div>
                  {r.progressPercent != null ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Progress: {r.progressPercent}%
                    </div>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>{r.requester}</TableCell>
              <TableCell>{r.assignedToTechnician}</TableCell>
              <TableCell>{r.assignedToTechnicianGroup}</TableCell>
              <TableCell>
                <StatusBadge status={r.status} />
              </TableCell>
              <TableCell>{r.priority}</TableCell>
              <TableCell>
                <div className="text-sm">{r.lastUpdate}</div>
                <div className="text-xs text-muted-foreground">
                  Opened: {r.openingDate}
                </div>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground"
              >
                No results.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Card>
  );
}
