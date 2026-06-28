import BaseService from "./BaseService";
import type { Portfolio } from "../models/Portfolio";
import type { AssetBuyResponse } from "../responses/AssetBuyResponse";
import type { AssetSellResponse } from "../responses/AssetSellResponse";
import type { AssetDividendResponse } from "../responses/AssetDividendResponse";
import type { PaginatedResponse } from "../responses/PaginatedResponse";
import type { CreatePortfolioPayload } from "../payloads/CreatePortfolioPayload";
import type { AddAssetBuyPayload } from "../payloads/AddAssetBuyPayload";
import type { AddAssetSellPayload } from "../payloads/AddAssetSellPayload";
import type { AddAssetDividendPayload } from "../payloads/AddAssetDividendPayload";
import type { UpdateAssetBuyPayload } from "../payloads/UpdateAssetBuyPayload";
import type { UpdateAssetSellPayload } from "../payloads/UpdateAssetSellPayload";
import type { UpdateAssetDividendPayload } from "../payloads/UpdateAssetDividendPayload";
import type { AssetCountResponse } from "../responses/AssetCountResponse";
import type { PortfolioTotalResponse } from "../responses/PortfolioTotalResponse";
import type { MetricResponse } from "../responses/MetricResponse";

class PortfolioService extends BaseService {
  private static instance: PortfolioService;

  private constructor() {
    super();
  }

  public static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService();
    }
    return PortfolioService.instance;
  }

  public async getPortfoliosByUserId(userId: string, page: number, limit: number, search?: string): Promise<PaginatedResponse<Portfolio>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    return this.request<PaginatedResponse<Portfolio>>(`/portfolio/user/${userId}?${params}`, {
      method: "GET",
    });
  }

  public async getAllPortfoliosByUserId(userId: string): Promise<Portfolio[]> {
    const result = await this.getPortfoliosByUserId(userId, 1, 1000);
    return result.data;
  }

  public async getPortfolioById(portfolioId: string): Promise<Portfolio> {
    return this.request<Portfolio>(`/portfolio/${portfolioId}`, {
      method: "GET",
    });
  }

  public async createPortfolio(payload: CreatePortfolioPayload): Promise<Portfolio> {
    return this.request<Portfolio>("/portfolio", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  public async getBuysByPortfolioId(portfolioId: string, page: number, limit: number, from?: string, to?: string, company?: string): Promise<PaginatedResponse<AssetBuyResponse>> {
    const params: URLSearchParams = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (from) {
      params.set("from", from);
    }
    if (to) {
      params.set("to", to);
    }
    if (company) {
      params.set("company", company);
    }

    return this.request<PaginatedResponse<AssetBuyResponse>>(`/portfolio/${portfolioId}/buys?${params}`, {
      method: "GET" 
    });
  }

  public async addAssetBuy(payload: AddAssetBuyPayload): Promise<AssetBuyResponse> {
    return this.request<AssetBuyResponse>(`/portfolio/${payload.portfolioId}/buys`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  public async getSellsByPortfolioId(portfolioId: string, page: number, limit: number, from?: string, to?: string, company?: string): Promise<PaginatedResponse<AssetSellResponse>> {
    const params: URLSearchParams = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (from) {
      params.set("from", from);
    }
    if (to) {
      params.set("to", to);
    }
    if (company) {
      params.set("company", company);
    }

    return this.request<PaginatedResponse<AssetSellResponse>>(`/portfolio/${portfolioId}/sells?${params}`, {
      method: "GET"
    });
  }

  public async addAssetSell(payload: AddAssetSellPayload): Promise<AssetSellResponse> {
    return this.request<AssetSellResponse>(`/portfolio/${payload.portfolioId}/sells`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  public async getDividendsByPortfolioId(portfolioId: string, page: number, limit: number, from?: string, to?: string, company?: string): Promise<PaginatedResponse<AssetDividendResponse>> {
    const params: URLSearchParams = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (from) {
      params.set("from", from);
    }
    if (to) {
      params.set("to", to);
    }
    if (company) {
      params.set("company", company);
    }

    return this.request<PaginatedResponse<AssetDividendResponse>>(`/portfolio/${portfolioId}/dividends?${params}`, {
      method: "GET"
    });
  }

  public async addAssetDividend(payload: AddAssetDividendPayload): Promise<AssetDividendResponse> {
    return this.request<AssetDividendResponse>(`/portfolio/${payload.portfolioId}/dividends`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  public async deleteAssetBuy(portfolioId: string, buyId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/portfolio/${portfolioId}/buys/${buyId}`, {
      method: "DELETE" 
    });

    if (!res.ok) {
      throw new Error("Failed to delete buy");
    }
  }

  public async deleteAssetSell(portfolioId: string, sellId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/portfolio/${portfolioId}/sells/${sellId}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      throw new Error("Failed to delete sell");
    }
  }

  public async deleteAssetDividend(portfolioId: string, dividendId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/portfolio/${portfolioId}/dividends/${dividendId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete dividend");
  }

  public async getCompaniesByPortfolioId(portfolioId: string): Promise<string[]> {
    return this.request<string[]>(`/portfolio/${portfolioId}/companies`, {
      method: "GET",
    });
  }

  public async getAssetCountByPortfolioId(portfolioId: string): Promise<AssetCountResponse> {
    return this.request<AssetCountResponse>(`/portfolio/${portfolioId}/asset-count`, {
      method: "GET",
    });
  }

  public async getAvailableShares(portfolioId: string, assetId: string, date: string): Promise<number> {
    const params = new URLSearchParams({ assetId, date });
    const res = await this.request<{ availableShares: number }>(`/portfolio/${portfolioId}/available-shares?${params}`, { method: "GET" });
    return res.availableShares;
  }

  public async getAverageBuyPrice(portfolioId: string, assetId: string, date: string): Promise<number | null> {
    const params = new URLSearchParams({ assetId, date });
    const res = await this.request<{ averageBuyPrice: number | null }>(`/portfolio/${portfolioId}/average-buy-price?${params}`, { method: "GET" });
    return res.averageBuyPrice;
  }

  public async getPortfolioTotal(portfolioId: string): Promise<PortfolioTotalResponse> {
    return this.request<PortfolioTotalResponse>(`/portfolio/${portfolioId}/total`, {
      method: "GET",
    });
  }

  public async updateAssetBuy(portfolioId: string, buyId: string, payload: UpdateAssetBuyPayload): Promise<AssetBuyResponse> {
    return this.request<AssetBuyResponse>(`/portfolio/${portfolioId}/buys/${buyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  public async updateAssetSell(portfolioId: string, sellId: string, payload: UpdateAssetSellPayload): Promise<AssetSellResponse> {
    return this.request<AssetSellResponse>(`/portfolio/${portfolioId}/sells/${sellId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  public async updateAssetDividend(portfolioId: string, dividendId: string, payload: UpdateAssetDividendPayload): Promise<AssetDividendResponse> {
    return this.request<AssetDividendResponse>(`/portfolio/${portfolioId}/dividends/${dividendId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  public async getMetrics(portfolioId: string, fromDate?: string): Promise<MetricResponse> {
    const qs = fromDate ? `?fromDate=${encodeURIComponent(fromDate)}` : "";
    return this.request<MetricResponse>(`/portfolio/${portfolioId}/metrics${qs}`, { method: "GET" });
  }

  public async deletePortfolio(portfolioId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/portfolio/${portfolioId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete portfolio");
    }
  }
}

export default PortfolioService;
