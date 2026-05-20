import { Card } from "@/components/ui/card";

export type TicketStatus =
  | "Processing (assigned)"
  | "Waiting"
  | "Resolved"
  | "Closed"
  | "New";

export function TicketKpis({
  totals,
}: {
  totals: Record<TicketStatus, number>;
}) {
  const totalOngoing =
    totals["Processing (assigned)"] + totals["Waiting"] + totals["New"];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Ongoing Tickets</div>
        <div className="mt-2 text-3xl font-semibold">{totalOngoing}</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Processing</div>
        <div className="mt-2 text-3xl font-semibold">
          {totals["Processing (assigned)"]}
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Waiting</div>
        <div className="mt-2 text-3xl font-semibold">{totals["Waiting"]}</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground">New</div>
        <div className="mt-2 text-3xl font-semibold">{totals["New"]}</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Resolved</div>
        <div className="mt-2 text-3xl font-semibold">{totals["Resolved"]}</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Closed</div>
        <div className="mt-2 text-3xl font-semibold">{totals["Closed"]}</div>
      </Card>
    </div>
  );
}
