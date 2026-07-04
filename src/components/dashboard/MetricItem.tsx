import type React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { MetricUI } from "../../models/UI/MetricUI";

const C = {
  gray400: "#9ca3af",
  gray800: "#1f2937",
};

interface MetricItemProps {
  metric: MetricUI;
}

const MetricItem: React.FC<MetricItemProps> = ({ metric }) => {
  return (
    <View style={styles.item}>
      <Text style={styles.value} numberOfLines={1}>
        {metric.value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {metric.key}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  item: { alignItems: "center" },
  value: { fontSize: 13, fontWeight: "700", color: C.gray800 },
  label: { fontSize: 9, color: C.gray400, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },
});

export default MetricItem;
