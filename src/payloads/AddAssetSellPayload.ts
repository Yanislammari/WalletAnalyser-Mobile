export interface AddAssetSellPayload {
  portfolioId: string;
  assetId?: string;
  sellCurrencyId: string;
  gainCurrencyId?: string;
  sellDate: string;
  assetSellAmount?: number;
  assetSellShare?: number;
  averageAssetShareBuyPrice?: number;
  assetSellGain?: number;
}
