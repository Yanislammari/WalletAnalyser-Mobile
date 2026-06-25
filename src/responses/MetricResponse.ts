export interface TopHolding {
  companyName: string;
  invested: number;
  allocation: number;
}

export interface MonthlyDataPoint {
  month: string;
  netGain: number;
  invested: number;
}

export interface MetricResponse {
  totalInvested: number;
  totalReturned: number;
  gain: number;
  gainPercent: number;
  cagr: number;
  volatility: number;
  sharpeRatio: number;
  totalDividends: number;
  dividendYield: number;
  firstBuyDate: string | null;
  periodYears: number;
  topHoldings: TopHolding[];
  monthlyData: MonthlyDataPoint[];
  currencyId: string;
  currencyName: string;
}
