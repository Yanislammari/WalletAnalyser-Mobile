export interface DividendForm {
  date: string;
  assetId: string;
  amount: string;
  currencyId: string;
}

export const emptyDividend = (): DividendForm => ({
  date: "",
  assetId: "",
  amount: "",
  currencyId: "",
});
