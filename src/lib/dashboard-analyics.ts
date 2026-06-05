export type ChartPoint = {
  date: string;
  newCustomers: number;
  activeAccounts: number;
  returningUsers: number;
};

export function calculateDashboardMetrics(data: ChartPoint[]) {
  const latest = data[data.length - 1];
  const previous = data[data.length - 2];

  const totalRevenue = data.reduce(
    (acc, item) => acc + item.newCustomers * 12.5,
    0,
  );

  const totalCustomers = data.reduce((acc, item) => acc + item.newCustomers, 0);

  const activeAccounts = latest.activeAccounts;

  const returningRate = Math.round(
    (latest.returningUsers / latest.activeAccounts) * 100,
  );

  const growthRate = (
    ((latest.newCustomers - previous.newCustomers) / previous.newCustomers) *
    100
  ).toFixed(1);

  return {
    totalRevenue,
    totalCustomers,
    activeAccounts,
    returningRate,
    growthRate,
    latest,
    previous,
  };
}
