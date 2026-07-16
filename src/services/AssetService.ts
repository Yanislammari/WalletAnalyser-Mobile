import BaseService from "./BaseService";
import type { Asset } from "../models/Asset";
import type { AssetPriceResponse } from "../responses/AssetPriceResponse";

class AssetService extends BaseService {
  private static instance: AssetService;

  private constructor() {
    super();
  }

  public static getInstance(): AssetService {
    if (!AssetService.instance) {
      AssetService.instance = new AssetService();
    }
    return AssetService.instance;
  }

  public async getAssets(): Promise<Asset[]> {
    return this.request<Asset[]>("/asset", {
      method: "GET"
    });
  }

  public async getAssetsPaginated(
    search?: string,
    offset = 0,
    limit  = 10,
  ): Promise<{ assets: Asset[]; hasMore: boolean }> {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("offset", String(offset));
    params.set("limit",  String(limit));
    return this.request<{ assets: Asset[]; hasMore: boolean }>(
      `/asset/search?${params.toString()}`,
      { method: "GET" },
    );
  }

  public async getAssetById(assetId: string): Promise<Asset | null> {
    try {
      return await this.request<Asset>(`/asset/${assetId}`, { method: "GET" });
    } catch {
      return null;
    }
  }

  public async previewCustomAsset(ticker: string): Promise<{
    ticker: string;
    officialName: string | null;
    currency: string | null;
    price: number | null;
    assetType: string | null;
  } | null> {
    try {
      return await this.request(`/asset/preview?ticker=${encodeURIComponent(ticker)}`, { method: "GET" });
    }
    catch {
      return null;
    }
  }

  public async createCustomAsset(ticker: string): Promise<Asset> {
    return this.request<Asset>("/asset/custom", {
      method: "POST",
      body: JSON.stringify({ ticker }),
    });
  }

  public async getAssetPrice(assetId: string, date: string): Promise<AssetPriceResponse | null> {
    try {
      return await this.request<AssetPriceResponse>(`/asset/${assetId}/price?date=${date}`, {
        method: "GET"
      });
    }
    catch {
      return null;
    }
  }
}

export default AssetService;
