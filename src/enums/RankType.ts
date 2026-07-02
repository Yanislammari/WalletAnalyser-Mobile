export const RankingType = {
  COUNTRIES: "countries",
  CLUSTERS: "clusters",
  SECTORS: "sectors",
} as const;

export type RankingType = typeof RankingType[keyof typeof RankingType];