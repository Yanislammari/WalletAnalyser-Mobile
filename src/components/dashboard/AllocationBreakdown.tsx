import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { AllocationItem } from "../../responses/MetricResponse";

// Palette: purple-ish family matching the app's colour scheme
const BAR_COLORS = [
  "#7c3aed", // purple-600
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#a78bfa", // violet-400
  "#c4b5fd", // violet-300
  "#818cf8", // indigo-400
  "#60a5fa", // blue-400
  "#34d399", // emerald-400
  "#fb923c", // orange-400
  "#f472b6", // pink-400
];

const OTHER_COLOR = "#d1d5db"; // gray-300

const OTHER_THRESHOLD_PCT = 5; // items with < 5 % are merged into "Other"
const MAX_SHOWN = 8;           // max named items before "Other" kicks in

interface AllocationBreakdownProps {
  title: string;
  items: AllocationItem[];
  currency: string;
}

const AllocationBreakdown: React.FC<AllocationBreakdownProps> = ({ title, items, currency }) => {
  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.noData}>No data</Text>
      </View>
    );
  }

  // Split into main + other
  const sorted = [...items].sort((a, b) => b.allocation - a.allocation);
  const main: AllocationItem[] = [];
  const other: AllocationItem[] = [];

  sorted.forEach((item, idx) => {
    if (idx < MAX_SHOWN && item.allocation >= OTHER_THRESHOLD_PCT) {
      main.push(item);
    } else {
      other.push(item);
    }
  });

  const otherTotal = other.reduce((s, i) => s + i.allocation, 0);
  const otherValue = other.reduce((s, i) => s + i.value, 0);

  const displayed: Array<AllocationItem & { isOther?: boolean }> = [...main];
  if (other.length > 0) {
    displayed.push({ name: `Other (${other.length})`, value: otherValue, allocation: otherTotal, isOther: true });
  }

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(v);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.listContainer}>
        {displayed.map((item, i) => {
          const color = item.isOther ? OTHER_COLOR : BAR_COLORS[i % BAR_COLORS.length];
          return (
            <View key={item.name} style={styles.row}>
              <View style={styles.rowHeader}>
                <Text numberOfLines={1} style={styles.itemName}>
                  {item.name}
                </Text>
                <Text style={styles.itemValue}>
                  {item.allocation.toFixed(1)}%
                  <Text style={styles.itemValueSub}> · {fmtCurrency(item.value)}</Text>
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.max(item.allocation, 0.5)}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    fontSize: 10,
    color: "#9ca3af", // gray-400
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 12,
    fontWeight: "600",
  },
  noData: {
    fontSize: 12,
    color: "#d1d5db", // gray-300
    textAlign: "center",
    paddingVertical: 24,
  },
  listContainer: {
    gap: 10, // Simulates the space-y-2.5 stack spacing
  },
  row: {
    width: "100%",
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 11,
    color: "#6b7280", // gray-500
    maxWidth: "65%",
  },
  itemValue: {
    fontSize: 11,
    fontWeight: "500",
    color: "#374151", // gray-700
  },
  itemValueSub: {
    fontWeight: "normal",
    color: "#9ca3af", // gray-400
  },
  progressBarBg: {
    height: 6,
    width: "100%",
    backgroundColor: "#f3f4f6", // gray-100
    borderRadius: 9999,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 9999,
  },
});

export default AllocationBreakdown;