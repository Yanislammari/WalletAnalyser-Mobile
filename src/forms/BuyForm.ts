import { InputMode } from "../enums/InputMode";

export interface BuyForm {
  date: string;
  assetId: string;
  inputMode: InputMode;
  amount: string;
  currencyId: string;
  shares: string;
  pricePerShare: string;
}

export const emptyBuy = (): BuyForm => ({
  date: "",
  assetId: "",
  inputMode: InputMode.AMOUNT,
  amount: "",
  currencyId: "",
  shares: "",
  pricePerShare: "",
});
