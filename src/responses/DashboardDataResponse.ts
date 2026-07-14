import type { TopHolding, AllocationItem, MonthlyDataPoint } from "./MetricResponse";

export interface DashboardDataResponse {
  monthlyData:      MonthlyDataPoint[];
  topHoldings:      TopHolding[];
  sectorBreakdown:  AllocationItem[];
  countryBreakdown: AllocationItem[];
  currencyId:   string;
  currencyName: string;
}
