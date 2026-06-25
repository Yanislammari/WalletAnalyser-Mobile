import BaseService from "./BaseService";
import type { Currency } from "../models/Currency";

class CurrencyService extends BaseService {
  private static instance: CurrencyService;

  private constructor() {
    super();
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  public async getAll(): Promise<Currency[]> {
    return this.request<Currency[]>("/currency", {
      method: "GET",
    });
  }

  public async convertPrice(from: string, to: string, amount: number): Promise<number> {
    const response = await this.request<{ convertedAmount: number }>(`/currency/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${amount}`, {
      method: "GET"
    });
    return response.convertedAmount;
  }
}

export default CurrencyService;
