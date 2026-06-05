import {
  getTickets,
  getTicketAssignedUsers,
  getTicketRequesters,
  getTicketGroups,
  GLPI_STATUS,
  GLPI_PRIORITY,
  GLPI_URGENCY,
  type GlpiTicketRaw,
} from "./client";

import type {
  TicketRow,
  TicketStatus,
} from "@/app/(main)/dashboard/ticketing-analytics/_components/ticket-table";

// Convert GLPI status number ke TicketStatus string
function toTicketStatus(statusNum: number): TicketStatus {
  const s = GLPI_STATUS[statusNum] ?? "";
  if (
    s.includes("Processing") ||
    s.includes("assigned") ||
    s.includes("planned")
  ) {
    return "Processing (assigned)";
  }
  if (s.includes("Waiting")) return "Waiting";
  if (s.includes("Solved")) return "Resolved";
  if (s.includes("Closed")) return "Closed";
  return "New";
}

function formatDate(raw: string | undefined): string {
  if (!raw) return "-";
  // GLPI returns "2025-08-01 14:30:00" → kita format jadi "01-08-2025 14:30"
  try {
    const d = new Date(raw.replace(" ", "T"));
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return raw;
  }
}

function mapPriority(num: number): string {
  // Map ke format P1-P5 yang biasa dipakai
  const map: Record<number, string> = {
    1: "P5",
    2: "P4",
    3: "P3",
    4: "P2",
    5: "P1",
    6: "P1",
  };
  return map[num] ?? `P${num}`;
}

// Map raw GLPI ticket + linked data → TicketRow
function mapToTicketRow(
  raw: GlpiTicketRaw,
  assignedUsers: string[],
  requesters: string[],
  groups: string[],
): TicketRow {
  return {
    id: raw.id,
    title: raw.name ?? `Tiket #${raw.id}`,
    requester: requesters.join(", ") || "Unknown",
    assignedToTechnician: assignedUsers.join(", ") || "Unassigned",
    assignedToTechnicianGroup:
      groups.join(", ") || "Technical Support Engineer",
    status: toTicketStatus(raw.status),
    priority: mapPriority(raw.priority),
    openingDate: formatDate(raw.date),
    lastUpdate: formatDate(raw.date_mod),
    closingDate: formatDate(raw.closedate ?? raw.solvedate) || undefined,
    urgency: GLPI_URGENCY[raw.urgency] ?? "-",
    impact: GLPI_URGENCY[raw.impact] ?? "-",
    description: raw.content
      ? raw.content.replace(/<[^>]*>/g, " ").trim()
      : undefined,
    progressPercent: raw.percent_done ?? 0,
  };
}

// -------------------------------------------------------
// Main export: fetch ongoing L2 tickets from real GLPI
// -------------------------------------------------------

export async function fetchOngoingL2Tickets(opts: {
  limit?: number;
  includeResolved?: boolean;
}): Promise<{
  rows: TicketRow[];
  totals: Record<TicketStatus, number>;
  fetchedAt: string;
  error?: string;
}> {
  const limit = opts.limit ?? 100;
  const statusFilter = opts.includeResolved ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4]; // ongoing only

  let rawTickets: GlpiTicketRaw[] = [];
  let error: string | undefined;

  try {
    rawTickets = await getTickets({
      range: `0-${limit - 1}`,
      statusFilter,
      withLinkedUsers: true,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Gagal fetch dari GLPI";
    console.error("[GLPI] fetchOngoingL2Tickets error:", error);
  }

  // Untuk tiap tiket, fetch linked users & groups
  // Kita batch dengan Promise.all tapi limit concurrency biar ga DDoS GLPI
  const rows: TicketRow[] = [];

  const chunkSize = 5;
  for (let i = 0; i < rawTickets.length; i += chunkSize) {
    const chunk = rawTickets.slice(i, i + chunkSize);
    const resolved = await Promise.allSettled(
      chunk.map(async (t) => {
        const [assignedUsers, requesters, groups] = await Promise.allSettled([
          getTicketAssignedUsers(t.id),
          getTicketRequesters(t.id),
          getTicketGroups(t.id),
        ]);

        const aUsers =
          assignedUsers.status === "fulfilled"
            ? assignedUsers.value.map((u) => u.name)
            : [];
        const reqs =
          requesters.status === "fulfilled"
            ? requesters.value.map((u) => u.name)
            : [];
        const grps =
          groups.status === "fulfilled" ? groups.value.map((g) => g.name) : [];

        return mapToTicketRow(t, aUsers, reqs, grps);
      }),
    );

    for (const r of resolved) {
      if (r.status === "fulfilled") rows.push(r.value);
    }
  }

  const totals: Record<TicketStatus, number> = {
    "Processing (assigned)": 0,
    Waiting: 0,
    Resolved: 0,
    Closed: 0,
    New: 0,
  };

  for (const row of rows) {
    if (row.status in totals) {
      totals[row.status as TicketStatus]++;
    }
  }

  return {
    rows,
    totals,
    fetchedAt: new Date().toISOString(),
    error,
  };
}

// Keep old dummy fallback untuk development tanpa GLPI
export { fetchOngoingL2Tickets as fetchOngoingL2TicketsDummyFallback };
