import { View, StyleSheet, Text } from "react-native";
import MetricItem from "./MetricItem";
import type { MetricUI } from "../../models/UI/MetricUI";
import type { MetricResponse } from "../../responses/MetricResponse";
import React from "react";

interface MetricStripProps {
  metrics: MetricResponse;
}

const MetricStrip: React.FC<MetricStripProps> = ({ metrics }) => {
  const fmtPct = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
  const fmt = (v: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: metrics.currencyName,
      maximumFractionDigits: 0,
    }).format(v);

  // Headline stats — 2x2, more horizontal room per item
  const topItems: MetricUI[] = [
    { key: "Gain", value: fmtPct(metrics.gainPercent) },
    { key: "CAGR", value: `${fmtPct(metrics.cagr)} / yr` },
    { key: "Sharpe", value: metrics.sharpeRatio.toFixed(2) },
    { key: "Volatility", value: `${metrics.volatility.toFixed(1)}%` }
  ];

  // Secondary stats — single row at the bottom, dark contrast block
  const bottomItems: MetricUI[] = [
    { key: "Div. yield", value: `${metrics.dividendYield.toFixed(1)}%` },
    { key: "Dividends", value: fmt(metrics.totalDividends) },
    { key: "Returned", value: fmt(metrics.totalReturned) },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topGrid}>
        {topItems.map((m) => (
          <View key={m.key} style={styles.topItem}>
            <MetricItem metric={m} />
          </View>
        ))}
      </View>

      <View style={styles.bottomRow}>
        {bottomItems.map((m, i) => (
          <View key={m.key} style={[styles.bottomItem, i > 0 && styles.bottomItemDivider]}>
            <MetricItem metric={m} labelStyle={styles.bottomLabel} valueStyle={styles.bottomValue} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  topGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  topItem: { width: "47%" },

  bottomRow: {
    flexDirection: "row",
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 8,
    marginHorizontal: -16,   // bleeds past panelCard's 16px padding to the edges
    paddingHorizontal: 16,   // ...then re-adds it internally so items stay aligned
  },
  bottomItem: { flex: 1, alignItems: "center" },
  bottomItemDivider: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: "rgba(255,255,255,0.15)",
  },
  bottomLabel: { color: "rgba(255,255,255,0.6)" },
  bottomValue: { color: "#ffffff" },
});

export default MetricStrip;
