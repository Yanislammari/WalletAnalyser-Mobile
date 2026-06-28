export interface AssetSellResponse {
  id: string;
  portfolioId: string;
  companyName: string | null;
  assetId: string | null;
  sellCurrencyId: string;
  sellDate: string;
  assetSellAmount: number | null;
  assetSellShare: number | null;
  averageAssetShareBuyPrice: number | null;
  assetSellGain: number | null;
  createdAt: string;
  updatedAt: string;
}
