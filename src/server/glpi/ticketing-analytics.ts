import { glpiGet, glpiPost } from "./client";

import type {
  TicketRow,
  TicketStatus,
} from "@/app/(main)/dashboard/ticketing-analytics/_components/ticket-table";

function toTicketStatus(status?: string): TicketStatus {
  const s = (status ?? "").toLowerCase();
  if (s.includes("processing") || s.includes("assigned"))
    return "Processing (assigned)";
  if (s.includes("waiting")) return "Waiting";
  if (s.includes("resolved")) return "Resolved";
  if (s.includes("closed")) return "Closed";
  return "New";
}

export async function fetchOngoingL2TicketsDummyFallback(args: {
  limit?: number;
}): Promise<{ rows: TicketRow[]; totals: Record<TicketStatus, number> }> {
  // For now we fetch minimal list of tickets. If GLPI endpoint differs, this will throw and we’ll fallback to dummy in page.
  const limit = args.limit ?? 50;

  // Typical GLPI REST: GET /Ticket?range=0-50
  // We keep mapping tolerant because GLPI custom fields can differ.
  const list = await glpiGet<any[]>(`/apirest.php/Ticket`, {
    range: `0-${limit}`,
  }).catch(async () => {
    // Some GLPI versions require action-based endpoints; try alternative.
    return glpiPost<any[]>(`/apirest.php/Ticket`, { range: `0-${limit}` });
  });

  const items = Array.isArray(list) ? list : [];

  const rows: TicketRow[] = items.slice(0, limit).map((t: any) => {
    const status = toTicketStatus(t?.status?.name ?? t?.status ?? t?.state);

    return {
      id: Number(t.id),
      title: t.name ?? t.problem?.name ?? String(t.id),
      requester: t.requester?.name ?? t.requester ?? t.user?.name ?? "Unknown",
      assignedToTechnician:
        t.assigned_to?.name ??
        t.technician?.name ??
        t.assignedToTechnician ??
        "Unknown",
      assignedToTechnicianGroup:
        t.assigned_to_group?.name ??
        t.technician_group?.name ??
        t.assignedToTechnicianGroup ??
        "Unknown",
      status,
      priority: t.priority?.name ?? t.priority ?? "P/NA",
      openingDate: t.opening_date ?? t.date ?? "",
      lastUpdate: t.last_update ?? t.update_date ?? "",
      closingDate: t.resolution_date ?? t.closed_date ?? undefined,
      urgency: t.urgency?.name ?? t.urgency ?? undefined,
      impact: t.impact?.name ?? t.impact ?? undefined,
      category: t.category?.name ?? t.category ?? undefined,
      location: t.location?.name ?? t.location ?? undefined,
      description: t.content ?? t.description ?? undefined,
    };
  });

  const totals: Record<TicketStatus, number> = {
    "Processing (assigned)": rows.filter(
      (r) => r.status === "Processing (assigned)",
    ).length,
    Waiting: rows.filter((r) => r.status === "Waiting").length,
    Resolved: rows.filter((r) => r.status === "Resolved").length,
    Closed: rows.filter((r) => r.status === "Closed").length,
    New: rows.filter((r) => r.status === "New").length,
  };

  return { rows, totals };
}
