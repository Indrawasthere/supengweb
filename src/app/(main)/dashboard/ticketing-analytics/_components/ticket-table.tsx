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
import { cn } from "@/lib/utils";

export type TicketStatus =
  | "Processing (assigned)"
  | "Waiting"
  | "Resolved"
  | "Closed"
  | "New";

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
    return (
      <Badge
        className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-500/10 dark:text-blue-300"
        variant="outline"
      >
        ● Processing
      </Badge>
    );
  if (s.includes("waiting"))
    return (
      <Badge
        className="border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/40 dark:bg-yellow-500/10 dark:text-yellow-300"
        variant="outline"
      >
        ◌ Waiting
      </Badge>
    );
  if (s.includes("resolved") || s.includes("solved"))
    return (
      <Badge
        className="border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-500/10 dark:text-green-300"
        variant="outline"
      >
        ✓ Resolved
      </Badge>
    );
  if (s.includes("closed")) return <Badge variant="outline">Closed</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = priority.toUpperCase();
  const colorMap: Record<string, string> = {
    P1: "border-red-300 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-400",
    P2: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-900/40 dark:bg-orange-500/10 dark:text-orange-400",
    P3: "border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-900/40 dark:bg-yellow-500/10 dark:text-yellow-400",
    P4: "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900/30 dark:bg-blue-500/10 dark:text-blue-400",
    P5: "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-500/10 dark:text-gray-400",
  };
  return (
    <Badge variant="outline" className={cn("font-mono", colorMap[p] ?? "")}>
      {priority}
    </Badge>
  );
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const color =
    pct >= 80
      ? "bg-green-500"
      : pct >= 50
        ? "bg-blue-500"
        : pct >= 20
          ? "bg-yellow-500"
          : "bg-gray-300";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-muted-foreground text-xs tabular-nums">{pct}%</span>
    </div>
  );
}

const FILTER_OPTIONS = [
  "Semua",
  "Processing",
  "Waiting",
  "New",
  "Resolved",
  "Closed",
] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

interface TicketTableProps {
  rows: TicketRow[];
  currentUserName?: string;
}

export function TicketTable({ rows, currentUserName }: TicketTableProps) {
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState<FilterOption>("Semua");
  const [myTicketsOnly, setMyTicketsOnly] = React.useState(false);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();

    return rows.filter((r) => {
      // Status filter
      if (filter !== "Semua") {
        const s = r.status.toLowerCase();
        if (filter === "Processing" && !s.includes("processing")) return false;
        if (filter === "Waiting" && !s.includes("waiting")) return false;
        if (filter === "New" && !s.includes("new")) return false;
        if (
          filter === "Resolved" &&
          !(s.includes("resolved") || s.includes("solved"))
        )
          return false;
        if (filter === "Closed" && !s.includes("closed")) return false;
      }

      // My tickets filter
      if (myTicketsOnly && currentUserName) {
        if (
          !r.assignedToTechnician
            .toLowerCase()
            .includes(currentUserName.toLowerCase())
        )
          return false;
      }

      // Search
      if (query) {
        return (
          r.id.toString().includes(query) ||
          r.title.toLowerCase().includes(query) ||
          r.requester.toLowerCase().includes(query) ||
          r.assignedToTechnician.toLowerCase().includes(query) ||
          r.assignedToTechnicianGroup.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [q, filter, myTicketsOnly, rows, currentUserName]);

  return (
    <Card className="p-4">
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-semibold text-lg">Daftar Tiket L2</div>
            <div className="text-muted-foreground text-sm">
              {filtered.length} dari {rows.length} tiket
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUserName && (
              <button
                type="button"
                onClick={() => setMyTicketsOnly((v) => !v)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-colors",
                  myTicketsOnly
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-muted",
                )}
              >
                Tiket Gue Aja
              </button>
            )}
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari ID / judul / requester..."
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm shadow-sm outline-none focus:border-primary sm:w-72"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-muted",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Judul Tiket</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioritas</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="w-[150px]">Last Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => {
              const isMyTicket =
                currentUserName &&
                r.assignedToTechnician
                  .toLowerCase()
                  .includes(currentUserName.toLowerCase());

              return (
                <TableRow
                  key={r.id}
                  className={cn(
                    isMyTicket && "bg-primary/5 dark:bg-primary/10",
                  )}
                >
                  <TableCell className="font-medium font-mono text-sm">
                    #{r.id}
                    {isMyTicket && (
                      <span className="ml-1 text-primary text-xs">★</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[220px] max-w-[380px]">
                      <div
                        className="truncate font-medium text-sm"
                        title={r.title}
                      >
                        {r.title}
                      </div>
                      {r.description && (
                        <div
                          className="mt-0.5 truncate text-muted-foreground text-xs"
                          title={r.description}
                        >
                          {r.description.slice(0, 120)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{r.requester}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {r.assignedToTechnician}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {r.assignedToTechnicianGroup}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={r.priority} />
                  </TableCell>
                  <TableCell>
                    <ProgressBar value={r.progressPercent ?? 0} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{r.lastUpdate}</div>
                    <div className="text-muted-foreground text-xs">
                      Dibuka: {r.openingDate}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-muted-foreground"
                >
                  {q || filter !== "Semua" || myTicketsOnly
                    ? "Tidak ada tiket yang cocok dengan filter."
                    : "Belum ada tiket."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
