import type React from "react";
import { View, Text, StyleSheet, type TextStyle } from "react-native";
import type { MetricUI } from "../../models/UI/MetricUI";
import { C } from "../../utils/color";

interface MetricItemProps {
  metric: MetricUI;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
}

const MetricItem: React.FC<MetricItemProps> = ({ metric, labelStyle, valueStyle }) => {
  return (
    <View style={styles.item}>
      <Text style={[styles.value, valueStyle]} numberOfLines={1}>
        {metric.value}
      </Text>
      <Text style={[styles.label, labelStyle]} numberOfLines={1}>
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