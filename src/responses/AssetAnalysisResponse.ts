interface Sector {
  uuid: string;
  sector_name: string;
}

interface Country {
  uuid: string;
  country_name: string;
}

interface Asset {
  uuid: string;
  display_name: string;
  sector_uuid: string;
  asset_type?: string;
}

interface Performer {
  asset: Asset;
  perf: number;
}

interface SectorData {
  sector?: Sector;
  unique_key?: number;
  country?: Country;
  length: number;
  mean_perf: number;
  best_performers: Performer[];
  worst_performers: Performer[];
}

export interface AssetAnalysisResponse {
  sectorsData: SectorData[];
}

interface Cluster {
  asset_uuid : string
  cluster : number
}

interface DetailedAsset {
  uuid: string;
  asset_type: string;
  ticker_name: string;
  display_name: string;
  sector_uuid: string;
  country_uuid: string;
  sector: Sector | null;
  country: Country | null;
  cluster : Cluster | null
}

export interface RankedAsset {
  asset: DetailedAsset;
  perf : number
  rank_sector : number | null
  rank_sector_position : string | null
  rank_country : number | null
  rank_country_position : string | null
  rank_cluster : number | null
  rank_cluster_position : string | null
}

export interface AssetRankingResponse {
  sectorsData: RankedAsset[];
}

interface AssetEntry {
  asset: DetailedAsset;
  perf: number;
  rank?: string;
}

export interface AssetPerformanceResponse {
  sectorsData: AssetEntry[];
}

export interface SectorNameResponse {
  sectorName: string;
}

export interface CountryNameResponse {
  countryName: string;
}