export interface Asset {
  id: string;
  baseCurrencyId: string | null;
  officialName: string | null;
  tickerName: string | null;
  assetType: string | null;
}
