import { TicketKpis, type TicketStatus } from "./_components/ticket-kpis";
import { TicketTable, type TicketRow } from "./_components/ticket-table";

import { fetchOngoingL2TicketsDummyFallback } from "@/server/glpi/ticketing-analytics";

const dummyRows: TicketRow[] = [
  {
    id: 278,
    title: "Terdapat Double Ticket - Sarinah Thamrin Jakarta",
    requester: "Yuga Prasetyo",
    assignedToTechnician: "Muhammad Dzikri Abdul Azis",
    assignedToTechnicianGroup: "Technical Support Engineer",
    status: "Processing (assigned)",
    priority: "P2",
    openingDate: "18-05-2026 08:11",
    lastUpdate: "19-05-2026 13:19",
    description:
      "Nama Pelapor : Wahid\nLokasi : Sarinah Thamrin Jakarta\nDeskripsi Kendala : Terdapat Double Ticket",
    urgency: "Medium",
    impact: "Medium",
    category: "ChatBot",
    location: "Sarinah Thamrin Jakarta",
    progressPercent: 45,
  },
  {
    id: 36,
    title: "Gangguan Aplikasi - PARKEE OS > Lainnya",
    requester: "Wahid Lokasi",
    assignedToTechnician: "Muhammad Dzikri Abdul Azis",
    assignedToTechnicianGroup: "Technical Support Engineer",
    status: "Waiting",
    priority: "P2",
    openingDate: "18-05-2026 08:21",
    lastUpdate: "18-05-2026 08:21",
    description: "Kendala masih ditangani tim TS dan menunggu validasi data.",
    urgency: "Medium",
    impact: "Medium",
    category: "Software",
    location: "Sarinah Thamrin Jakarta",
    progressPercent: 20,
  },
  {
    id: 142,
    title: "Login gagal setelah update - PARKEE OS",
    requester: "Nadia",
    assignedToTechnician: "Afif",
    assignedToTechnicianGroup: "L2 Technical Support",
    status: "Resolved",
    priority: "P1",
    openingDate: "17-05-2026 10:04",
    lastUpdate: "18-05-2026 09:41",
    closingDate: "18-05-2026 09:41",
    description: "Fix di sisi konfigurasi auth dan rollback sebagian setting.",
    urgency: "High",
    impact: "High",
    category: "Authentication",
    location: "Jakarta",
    progressPercent: 100,
  },
];

const dummyTotals: Record<TicketStatus, number> = {
  "Processing (assigned)": dummyRows.filter(
    (r) => r.status === "Processing (assigned)",
  ).length,
  Waiting: dummyRows.filter((r) => r.status === "Waiting").length,
  Resolved: dummyRows.filter((r) => r.status === "Resolved").length,
  Closed: dummyRows.filter((r) => r.status === "Closed").length,
  New: dummyRows.filter((r) => r.status === "New").length,
};

export default async function Page() {
  let rows = dummyRows;
  let totals: Record<TicketStatus, number> = dummyTotals;

  try {
    const res = await fetchOngoingL2TicketsDummyFallback({ limit: 50 });
    rows = res.rows;
    totals = res.totals;
  } catch {
    // keep dummy
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl tracking-tight">Ticketing Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Ongoing tickets assigned to your L2 team. (Dummy data for now)
        </p>
      </div>

      <TicketKpis totals={totals} />

      <TicketTable rows={dummyRows} />
    </div>
  );
}
