import { InputMode } from "../enums/InputMode";

export interface SellForm {
  date: string;
  assetId: string;
  inputMode: InputMode;
  amount: string;
  currencyId: string;
  shares: string;
  pricePerShare: string;
  capitalGain: string;
  gainCurrencyId: string;
}

export const emptySell = (): SellForm => ({
  date: "",
  assetId: "",
  inputMode: InputMode.AMOUNT,
  amount: "",
  currencyId: "",
  shares: "",
  pricePerShare: "",
  capitalGain: "",
  gainCurrencyId: "",
});
