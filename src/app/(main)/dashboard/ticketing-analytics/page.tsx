import { Suspense } from "react";
import { getSessionUser } from "@/server/auth/session";
import { fetchOngoingL2Tickets } from "@/server/glpi/ticketing-analytics";
import { TicketKpis, type TicketStatus } from "./_components/ticket-kpis";
import { TicketTable } from "./_components/ticket-table";
import { GlpiStatusBanner } from "./_components/glpi-status-banner";
import { checkGlpiHealth } from "@/server/glpi/client";

const DUMMY_ROWS = [
  {
    id: 278,
    title: "Terdapat Double Ticket - Sarinah Thamrin Jakarta",
    requester: "Wahid",
    assignedToTechnician: "Muhammad Dzikri Abdul Azis",
    assignedToTechnicianGroup: "Technical Support Engineer",
    status: "Processing (assigned)" as TicketStatus,
    priority: "P2",
    openingDate: "18-05-2026 08:11",
    lastUpdate: "19-05-2026 13:19",
    description:
      "Nama Pelapor : Wahid\nLokasi : Sarinah Thamrin Jakarta\nDeskripsi Kendala : Terdapat Double Ticket",
    urgency: "Medium",
    impact: "Medium",
    progressPercent: 45,
  },
  {
    id: 36,
    title: "Gangguan Aplikasi - PARKEE OS > Lainnya",
    requester: "Wahid Lokasi",
    assignedToTechnician: "Muhammad Dzikri Abdul Azis",
    assignedToTechnicianGroup: "Technical Support Engineer",
    status: "Waiting" as TicketStatus,
    priority: "P2",
    openingDate: "18-05-2026 08:21",
    lastUpdate: "18-05-2026 08:21",
    description: "Kendala masih ditangani tim TS dan menunggu validasi data.",
    urgency: "Medium",
    impact: "Medium",
    progressPercent: 20,
  },
  {
    id: 12174,
    title:
      "qris option tidak tampil saat tap kartu master lost tiket | gedung melawai bsd",
    requester: "Muhammad Rizky",
    assignedToTechnician: "Muhammad Dzikri Abdul Azis",
    assignedToTechnicianGroup: "Technical Support Engineer",
    status: "Processing (assigned)" as TicketStatus,
    priority: "P2",
    openingDate: "01-08-2025 19:49",
    lastUpdate: "09-08-2025 08:52",
    description:
      "Nama Pelapor : nova Lokasi : gedung melawai bsd. Issue : saat tap kartu master card Lost_Ticket pada qris option tidak tampil barcode qr nya hanya terdapat keterangan error, namun saat di tap kartu uang elektronik langsung te (...)",
    urgency: "Medium",
    impact: "Medium",
    progressPercent: 30,
  },
];

export default async function Page() {
  const user = await getSessionUser();

  // Cek GLPI health dulu
  const glpiHealth = await checkGlpiHealth().catch(() => ({
    ok: false,
    message: "Tidak bisa connect ke GLPI — cek env vars",
  }));

  let rows = DUMMY_ROWS;
  let totals: Record<TicketStatus, number> = {
    "Processing (assigned)": DUMMY_ROWS.filter(
      (r) => r.status === "Processing (assigned)",
    ).length,
    Waiting: DUMMY_ROWS.filter((r) => r.status === "Waiting").length,
    Resolved: 0,
    Closed: 0,
    New: 0,
  };
  let fetchedAt: string | undefined;
  let fetchError: string | undefined;

  if (glpiHealth.ok) {
    try {
      const result = await fetchOngoingL2Tickets({ limit: 100 });
      if (result.rows.length > 0) {
        rows = result.rows;
        totals = result.totals;
        fetchedAt = result.fetchedAt;
        fetchError = result.error;
      }
    } catch (err) {
      fetchError = err instanceof Error ? err.message : "Gagal fetch tiket";
    }
  }

  const greetName = user?.name?.split(" ")[0] ?? "Tim TSE";

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl tracking-tight">Ticketing Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Halo, <span className="font-medium text-foreground">{greetName}</span>
          ! Ini overview tiket ongoing L2 divisi TSE.
          {fetchedAt && (
            <span className="ml-1 opacity-60">
              — Update terakhir:{" "}
              {new Date(fetchedAt).toLocaleTimeString("id-ID")}
            </span>
          )}
        </p>
      </div>

      {/* GLPI connection banner */}
      <GlpiStatusBanner
        isConnected={glpiHealth.ok}
        message={glpiHealth.ok ? glpiHealth.message : glpiHealth.message}
        fetchError={fetchError}
      />

      {/* KPI Cards */}
      <TicketKpis totals={totals} />

      {/* Ticket Table */}
      <TicketTable rows={rows} currentUserName={user?.name} />
    </div>
  );
}
