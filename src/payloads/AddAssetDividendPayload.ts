export interface AddAssetDividendPayload {
  portfolioId: string;
  assetId?: string;
  currencyId: string;
  cashflowDate: string;
  cashflowAmount: number;
}
