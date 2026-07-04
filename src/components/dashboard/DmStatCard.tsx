import type React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { DmStatUI } from "../../models/UI/DmStatUI";

const C = {
  gray900: "#111827",
  gray400: "#9ca3af",
  gray50: "#f9fafb",
  emerald600: "#059669",
  rose500: "#f43f5e",
};

interface DmStatProps {
  stat: DmStatUI;
}

const DmStatCard: React.FC<DmStatProps> = ({ stat } : DmStatProps) => {
  const deltaColor = stat.neutral ? C.gray400 : stat.up ? C.emerald600 : C.rose500;
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{stat.label}</Text>
      <Text style={styles.value}>{stat.value}</Text>
      <Text style={[styles.delta, { color: deltaColor }]}>{stat.delta}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.gray50,
    borderRadius: 12,
    padding: 14,
  },
  label: {
    color: C.gray400,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    color: C.gray900,
    fontSize: 20,
    fontWeight: "700",
  },
  delta: {
    fontSize: 11,
    marginTop: 2,
  },
});

export default DmStatCard;
