export interface TopHolding {
  companyName: string;
  invested: number;
  allocation: number;
}


export interface AllocationItem {
  name: string;
  value: number;
  allocation: number;
}

export interface MonthlyDataPoint {
  month: string;
  netGain: number;
  invested: number;
  netCostBasis: number;
  marketValue: number;
}

export interface MonthlyTwrPoint {
  month: string;
  cumTwr: number; // cumulative chain-linked TWR (%) from portfolio start
}

export interface MetricResponse {
  // Core financials (realized only)
  totalInvested: number;
  totalReturned: number;
  gain: number;
  gainPercent: number;

  // Mark-to-market (realized + current value of held positions)
  portfolioMarketValue: number;
  gainMtm: number;
  gainPercentMtm: number;
  cagrMtm: number;
  xirrMtm: number;

  // Performance
  cagr: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  twr: number;
  twrAnnualized: number;
  logTwr: number;
  xirr: number;

  // Drawdown
  maxDrawdown: number;
  maxDrawdownDurationMonths: number;

  // Income
  totalDividends: number;
  dividendYield: number;

  // Context
  firstBuyDate: string | null;
  periodYears: number;

  // Breakdown
  topHoldings: TopHolding[];
  monthlyData: MonthlyDataPoint[];
  monthlyTwr: MonthlyTwrPoint[];

  currencyId: string;
  currencyName: string;
}

export interface MetricResponse {
  // Core financials (realized only)
  totalInvested: number;
  totalReturned: number;
  gain: number;
  gainPercent: number;

  // Mark-to-market (realized + current value of held positions)
  portfolioMarketValue: number;
  gainMtm: number;
  gainPercentMtm: number;
  cagrMtm: number;
  xirrMtm: number;

  // Performance
  cagr: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  twr: number;
  twrAnnualized: number;
  logTwr: number;
  xirr: number;

  // Drawdown
  maxDrawdown: number;
  maxDrawdownDurationMonths: number;

  // Income
  totalDividends: number;
  dividendYield: number;

  // Context
  firstBuyDate: string | null;
  periodYears: number;

  // Breakdown
  topHoldings: TopHolding[];
  sectorBreakdown: AllocationItem[];
  countryBreakdown: AllocationItem[];
  monthlyData: MonthlyDataPoint[];
  monthlyTwr: MonthlyTwrPoint[];

  currencyId: string;
  currencyName: string;
}