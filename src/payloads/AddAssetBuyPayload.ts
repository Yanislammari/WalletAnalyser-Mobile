export interface AddAssetBuyPayload {
  portfolioId: string;
  assetId?: string;
  buyCurrencyId: string;
  buyDate: string;
  assetBuyAmount?: number;
  assetBuyShare?: number;
  assetBuyPricePerShare?: number;
}
