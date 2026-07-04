import type React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { TopHolding } from "../../responses/MetricResponse";

const COLORS = [
  "#a855f7", // purple-500
  "#818cf8", // indigo-400
  "#c4b5fd", // violet-300
  "#f9a8d4", // pink-300
  "#e9d5ff", // purple-200
  "#93c5fd", // blue-300
];

const C = {
  gray50: "#f9fafb",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray700: "#374151",
};

interface SectorBreakdownProps {
  holdings: TopHolding[];
}

const SectorBreakdown: React.FC<SectorBreakdownProps> = ({ holdings }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Asset allocation</Text>
      {holdings.length === 0 ? (
        <Text style={styles.emptyText}>No holdings yet</Text>
      ) : (
        holdings.map((h, i) => (
          <View key={h.companyName} style={styles.row}>
            <View style={styles.rowLabelLine}>
              <Text style={styles.name} numberOfLines={1}>
                {h.companyName}
              </Text>
              <Text style={styles.pct}>{h.allocation.toFixed(1)}%</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.max(h.allocation, 1)}%`,
                    backgroundColor: COLORS[i % COLORS.length],
                  },
                ]}
              />
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: C.gray50, borderRadius: 12, padding: 16 },
  header: {
    color: C.gray400,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  emptyText: { color: C.gray300, fontSize: 12, textAlign: "center", paddingVertical: 24 },

  row: { marginBottom: 10 },
  rowLabelLine: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, gap: 8 },
  name: { flex: 1, fontSize: 11, color: C.gray500 },
  pct: { fontSize: 11, fontWeight: "500", color: C.gray700 },

  track: { height: 6, width: "100%", backgroundColor: C.gray200, borderRadius: 999, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 999 },
});

export default SectorBreakdown;
