import React, { useRef, useState } from "react";
import { View, Text, Pressable, Animated, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import type { RankedAsset } from "../../responses/AssetAnalysisResponse";

export interface UserStocksRankingProps {
  onClick: () => void;
  rankAsset: RankedAsset;
}

export interface SectorCardDataProps {
  name: string | null;
  perf52w: number | null;
  length: number | null;
  top: PerformerStocksProps[];
  worst: PerformerStocksProps[];
  onClick: () => void;
}

export interface PerformerStocksProps {
  name: string | null;
  perf: number | null;
}

const getPerfBg = (perf: number | null) => {
  if (perf == null) return "#FAFAFA";
  if (perf >= 30) return "#BBF7D0";
  if (perf >= 15) return "#DCFCE7";
  if (perf >= 5) return "#F0FDF4";
  if (perf >= -5) return "#FAFAFA";
  if (perf >= -15) return "#FEF2F2";
  if (perf >= -30) return "#FEE2E2";
  return "#FECACA";
};

const getPerfText = (perf: number | null) => {
  if (perf == null) return "#B91C1C";
  if (perf >= 5) return "#15803D";
  if (perf >= -5) return "#71717A";
  return "#B91C1C";
};

const fmt = (n: number | null) => {
  if (n == null) return "-";
  return (n >= 0 ? "+" : "") + n.toFixed(1) + "%";
};

const PerformerRow = ({ performers }: { performers: PerformerStocksProps[] }) => (
  <View style={styles.performerRow}>
    {performers.map((p) => (
      <View
        key={p.name}
        style={[styles.performerCell, { backgroundColor: getPerfBg(p.perf) }]}
      >
        <Text style={styles.performerName} numberOfLines={1}>
          {p.name ? (p.name.length > 15 ? p.name.slice(0, 15) + "…" : p.name) : ""}
        </Text>
        <Text style={[styles.performerPerf, { color: getPerfText(p.perf) }]}>
          {fmt(p.perf)}
        </Text>
      </View>
    ))}
  </View>
);

const CardSectorPerf = (sector: SectorCardDataProps) => {
  const [open, setOpen] = useState(false);
  const isPositive = (sector?.perf52w ?? 0) >= 0;
  const rotation = useRef(new Animated.Value(0)).current;

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    Animated.timing(rotation, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotateStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
  };

  return (
    <View style={styles.card}>
      <Pressable
        style={[
          styles.header,
          { backgroundColor: isPositive ? "#F0FDF4" : "#FEF2F2", borderBottomColor: isPositive ? "#DCFCE7" : "#FEE2E2" },
        ]}
        onPress={toggleOpen}
      >
        <View
          style={[
            styles.chevronCircle,
            { backgroundColor: isPositive ? "#DCFCE7" : "#FEE2E2" },
          ]}
        >
          <Animated.View style={rotateStyle}>
            <Icon name="chevron-down" size={14} color={isPositive ? "#15803D" : "#B91C1C"} />
          </Animated.View>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {sector.name}
          </Text>
          <Text style={styles.headerLength}>{sector.length} elements</Text>
        </View>

        <Text style={styles.headerPerf}>
          {isPositive ? "+" : ""}
          {sector?.perf52w ? sector.perf52w.toFixed(1) : "-"}%
        </Text>
      </Pressable>

      {open && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Top performers</Text>
            <PerformerRow performers={sector.top} />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Worst performers</Text>
            <PerformerRow performers={sector.worst} />
          </View>
          <View style={[styles.footer,styles.iconBadge]}>
            <Pressable
              style={({ pressed }) => [styles.seeMoreButton, pressed && styles.seeMoreButtonPressed]}
              onPress={sector.onClick}
            >
              <Text style={styles.seeMoreText}>View more</Text>
              <Icon name="arrow-forward" size={14} color="#52525B" />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E4E4E7",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerInfo: { flex: 1, minWidth: 0 },
  headerName: { fontSize: 14, fontWeight: "500", color: "#18181B" },
  headerLength: { fontSize: 12, color: "#A1A1AA" },
  headerPerf: { fontSize: 14, fontWeight: "600", color: "#18181B" },

  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F5",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#A1A1AA",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  performerRow: { flexDirection: "row", gap: 8 },
  performerCell: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  performerName: { fontSize: 12, fontWeight: "500", color: "#3F3F46" },
  performerPerf: { fontSize: 14, fontWeight: "600", marginTop: 2 },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  seeMoreButtonPressed: { backgroundColor: "#F4F4F5" },
  seeMoreText: { fontSize: 14, fontWeight: "500", color: "#52525B" },
  iconBadge: {
    backgroundColor: "#cfcfcf",
    color: "#fff",
    margin: 16,
    alignItems: "flex-start",
    justifyContent: "center",
    borderRadius: 15,
    paddingTop: 8,
  },
});

export default CardSectorPerf;