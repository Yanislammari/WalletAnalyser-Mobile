import type { RankingType } from "../enums/RankType";
import type { AssetAnalysisResponse, AssetRankingResponse, CountryNameResponse, SectorNameResponse } from "../responses/AssetAnalysisResponse";
import BaseService from "./BaseService";

class AnalysisService extends BaseService {
  private static instance: AnalysisService;
  private readonly url = "/clusters/"

  private constructor() {
    super();
  }

  public static getInstance(): AnalysisService {
    if (!AnalysisService.instance) {
      AnalysisService.instance = new AnalysisService();
    }
    return AnalysisService.instance;
  }

  public async getSectorsMetaData(): Promise<AssetAnalysisResponse> {
    return this.request<AssetAnalysisResponse>(this.url + "sectors", {
        method: "GET" 
    });
  }

  public async getCountriesMetaData(): Promise<AssetAnalysisResponse> {
    return this.request<AssetAnalysisResponse>(this.url + "countries", {
        method: "GET" 
    });
  }

  public async getClustersMetaData(): Promise<AssetAnalysisResponse> {
    return this.request<AssetAnalysisResponse>(this.url + "clusters", {
        method: "GET" 
    });
  }

  public async getUserStocksMetaData(portolio_id : string): Promise<AssetRankingResponse>{
    return this.request<AssetRankingResponse>(this.url + "user_stocks/"+portolio_id, {
        method: "GET" 
    });
  }

  public async getWholeSectorsDetailMetaData(type : RankingType, uuid : string): Promise<AssetRankingResponse>{
    return this.request<AssetRankingResponse>(this.url + `sector_detail?type=${type}&uuid=${uuid}`, {
        method: "GET" 
    });
  }

  public async getSectorName(sector_uuid : string): Promise<SectorNameResponse>{
    return this.request<SectorNameResponse>(this.url + `name/${sector_uuid}`, {
        method: "GET" 
    });
  }

  public async getCountryName(country_uuid : string): Promise<CountryNameResponse>{
    return this.request<CountryNameResponse>(this.url + `country_name/${country_uuid}`, {
        method: "GET" 
    });
  }
}

export default AnalysisService;