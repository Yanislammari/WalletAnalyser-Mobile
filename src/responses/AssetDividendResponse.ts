export interface AssetDividendResponse {
  id: string;
  portfolioId: string;
  companyName: string | null;
  currencyId: string;
  cashflowDate: string;
  cashflowAmount: number;
  createdAt: string;
  updatedAt: string;
}
