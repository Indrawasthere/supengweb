import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Waves,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { calculateDashboardMetrics } from "@/lib/dashboard-analytics";
import { chartData } from "../performance-overview/data";

export function MetricCards() {
  const metrics = calculateDashboardMetrics(chartData);

  const growthPositive = Number(metrics.growthRate) >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
      <Card className="border-none bg-gradient-to-br from-emerald-500/10 to-background shadow-sm">
        <CardHeader>
          <CardTitle>
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/15">
              <DollarSign className="size-4 text-emerald-500" />
            </div>
          </CardTitle>

          <CardDescription>Total Revenue</CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold tracking-tight">
              $
              {Intl.NumberFormat("en-US").format(
                Math.round(metrics.totalRevenue),
              )}
            </div>

            <Badge variant="secondary">
              <TrendingUp className="mr-1 size-3" />
              +12.4%
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Estimated revenue from customer acquisition
          </p>
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-sky-500/10 to-background shadow-sm">
        <CardHeader>
          <CardTitle>
            <div className="flex size-8 items-center justify-center rounded-xl bg-sky-500/15">
              <UserPlus className="size-4 text-sky-500" />
            </div>
          </CardTitle>

          <CardDescription>Total Customers</CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold tracking-tight">
              {Intl.NumberFormat("en-US").format(metrics.totalCustomers)}
            </div>

            <Badge variant="secondary">
              <TrendingUp className="mr-1 size-3" />
              +8.2%
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            New signups across all channels
          </p>
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-violet-500/10 to-background shadow-sm">
        <CardHeader>
          <CardTitle>
            <div className="flex size-8 items-center justify-center rounded-xl bg-violet-500/15">
              <Users className="size-4 text-violet-500" />
            </div>
          </CardTitle>

          <CardDescription>Active Accounts</CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold tracking-tight">
              {Intl.NumberFormat("en-US").format(metrics.activeAccounts)}
            </div>

            <Badge variant="secondary">
              <TrendingUp className="mr-1 size-3" />
              Stable
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Users active within the last 24 hours
          </p>
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-orange-500/10 to-background shadow-sm">
        <CardHeader>
          <CardTitle>
            <div className="flex size-8 items-center justify-center rounded-xl bg-orange-500/15">
              <Waves className="size-4 text-orange-500" />
            </div>
          </CardTitle>

          <CardDescription>Growth Rate</CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold tracking-tight">
              {metrics.growthRate}%
            </div>

            <Badge variant={growthPositive ? "default" : "destructive"}>
              {growthPositive ? (
                <TrendingUp className="mr-1 size-3" />
              ) : (
                <TrendingDown className="mr-1 size-3" />
              )}

              {growthPositive ? "Positive" : "Declining"}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Customer growth compared to previous period
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
