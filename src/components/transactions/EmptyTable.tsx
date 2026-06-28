import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

interface EmptyTableProps {
  onAdd: () => void;
  label: string;
  filtered?: boolean;
  selectedCompany?: string | null;
  dateFiltered?: boolean;
}

const EmptyTable: React.FC<EmptyTableProps> = (props) => {
  if (props.filtered || props.dateFiltered) {
    const subtitle = props.selectedCompany
      ? `No results for "${props.selectedCompany}"`
      : "Try adjusting your filters";

    return (
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Ionicons name="funnel-outline" size={20} color="#9ca3af" />
        </View>
        <View style={styles.textGroup}>
          <Text style={styles.title}>No {props.label} match your filters</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="add-outline" size={20} color="#9ca3af" />
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.title}>No {props.label} yet</Text>
        <Text style={styles.subtitle}>Tap + to add a row</Text>
      </View>
      <TouchableOpacity onPress={props.onAdd} style={styles.addButton} activeOpacity={0.7}>
        <Ionicons name="add-outline" size={15} color="#7c3aed" />
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  textGroup: {
    alignItems: "center",
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4b5563",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f5f3ff",
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#7c3aed",
  },
});

export default EmptyTable;