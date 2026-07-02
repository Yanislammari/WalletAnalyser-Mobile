import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { toast } from "sonner-native";

import type { RankedAsset } from "../../responses/AssetAnalysisResponse";
import { clusterName } from "../../utils/ClusterNaming";
import { RankingType } from "../../enums/RankType";

type RootStackParamList = {
  AnalysisDetail: { id: string | number; type: RankingType; offset: number };
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RankedProps {
  rankAsset: RankedAsset;
  mainRank: RankingType; // you control which one is "main"
}

export function getMainRankPosition(rankAsset: RankedAsset, mainRank: RankingType) {
  const positionStr = (() => {
    switch (mainRank) {
      case RankingType.SECTORS:
        return rankAsset.rank_sector_position;
      case RankingType.COUNTRIES:
        return rankAsset.rank_country_position;
      case RankingType.CLUSTERS:
        return rankAsset.rank_cluster_position;
    }
  })();

  const [value, total] = positionStr?.split("/").map(Number) ?? [-1, -1];
  return { value, total };
}

function getMainLabel(rankAsset: RankedAsset, mainRank: RankingType): string {
  switch (mainRank) {
    case RankingType.SECTORS:
      return rankAsset.asset?.sector?.sector_name != null
        ? `in ${rankAsset.asset.sector.sector_name}`
        : "";
    case RankingType.COUNTRIES:
      return rankAsset.asset?.country?.country_name != null
        ? `in ${rankAsset.asset.country.country_name}`
        : "";
    default:
      return "compared to peers";
  }
}

export const StocksDetail: React.FC<RankedProps> = (rankAssetProps) => {
  const navigation = useNavigation<NavigationProp>();
  const rankAsset = rankAssetProps.rankAsset;
  const perf = rankAsset?.perf ?? 0;
  const isPositive = perf >= 0;
  const { value, total } = getMainRankPosition(rankAsset, rankAssetProps.mainRank);

  const topOrBottom =
    value === -1 || total === -1
      ? "Position not found"
      : (() => {
          const pct = Math.round((value / total) * 100);
          return isPositive ? `Top ${pct === 0 ? 1 : pct}%` : `Bottom ${100 - pct}%`;
        })();

  const displayName = rankAsset.asset.display_name
    ? rankAsset.asset.display_name.length > 40
      ? rankAsset.asset.display_name.slice(0, 40) + "…"
      : rankAsset.asset.display_name
    : "";

  const handleTagClick = (type: RankingType, position: number, id: string | number | undefined) => {
    if (!id && id !== 0) {
      toast.info("You can't access this");
      return;
    }
    navigation.navigate("AnalysisDetail", { id, type, offset: position });
  };

  const allTags = [
    {
      type: RankingType.COUNTRIES,
      label: rankAsset?.asset?.country?.country_name ?? "Unknown",
      rank: rankAsset.rank_country_position,
      pos: rankAsset.rank_country,
      id: rankAsset.asset.country_uuid,
    },
    {
      type: RankingType.SECTORS,
      label: rankAsset?.asset?.sector?.sector_name ?? "Unknown",
      rank: rankAsset.rank_sector_position,
      pos: rankAsset.rank_sector,
      id: rankAsset.asset.sector_uuid,
    },
    {
      type: RankingType.CLUSTERS,
      label: clusterName(rankAsset.asset.cluster?.cluster) ?? "Unknown",
      rank: rankAsset.rank_cluster_position,
      pos: rankAsset.rank_cluster,
      id: rankAsset.asset.cluster?.cluster,
    },
  ];

  // Le mainRank est déjà affiché dans topOrBottom, donc on l'exclut des tags
  const mainTag = allTags.find((t) => t.type === rankAssetProps.mainRank);
  const tags = allTags.filter((t) => t.type !== rankAssetProps.mainRank);

  const handleMainRankClick = () => {
    if (!mainTag) return;
    handleTagClick(mainTag.type, mainTag.pos ?? 0, mainTag.id);
  };

  return (
    <View style={[styles.container, isPositive ? styles.rowPositive : styles.rowNegative]}>

      {/* Top line: badge + name + perf, cliquable vers le mainRank */}
      <Pressable
        onPress={handleMainRankClick}
        style={({ pressed }) => [styles.topRow, pressed && styles.topRowPressed]}
      >
        <View style={[styles.badge, { backgroundColor: isPositive ? "#BBF7D0" : "#FECACA" }]}>
          <Text style={[styles.badgeText, { color: isPositive ? "#14532D" : "#7F1D1D" }]}>
            {value === -1 ? "#" : value}
          </Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName} ({rankAsset.asset.ticker_name ?? ""})
          </Text>
          <Text style={styles.subLabel} numberOfLines={1}>
            {topOrBottom} {getMainLabel(rankAsset, rankAssetProps.mainRank)}
          </Text>
        </View>

        <Text style={[styles.perf, { color: isPositive ? "#166534" : "#991B1B" }]}>
          {isPositive ? "+" : ""}
          {perf.toFixed(1)}%
        </Text>
      </Pressable>

      {/* Bottom line: les 2 tags restants, un peu plus hauts */}
      <View style={styles.tagsRow}>
        {tags.map((tag, i) => (
          <Pressable
            key={i}
            onPress={() => handleTagClick(tag.type as RankingType, tag.pos ?? 0, tag.id)}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            style={({ pressed }) => [styles.tag, pressed && styles.tagPressed]}
          >
            <Text style={styles.tagLabel} numberOfLines={1}>
              {tag.label}
            </Text>
            <Text style={styles.tagRank}>#{tag.rank}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rowPositive: { backgroundColor: "#F0FDF4", borderBottomColor: "#DCFCE7" },
  rowNegative: { backgroundColor: "#FEF2F2", borderBottomColor: "#FEE2E2" },

  badge: {
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  badgeText: { fontSize: 13, fontWeight: "500" },
  container: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  topRowPressed: {
    opacity: 0.7, // feedback visuel au clic sur toute la ligne
  },
  infoBlock: {
    flex: 1, // takes remaining space between badge and perf
  },
  name: { fontSize: 14, fontWeight: "500", color: "#18181B" },
  subLabel: { fontSize: 12, color: "#A1A1AA", marginTop: 2 },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8, // plus de hauteur (était 4)
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    maxWidth: "48%",
  },
  tagPressed: {
    backgroundColor: "#E5E7EB",
    transform: [{ scale: 0.97 }],
  },
  tagLabel: { fontSize: 11, color: "#000000", maxWidth: "100%" },
  tagRank: { fontSize: 10, color: "#A1A1AA" },
  perf: {
    fontSize: 14,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
    flexShrink: 0,
  },
  
});
