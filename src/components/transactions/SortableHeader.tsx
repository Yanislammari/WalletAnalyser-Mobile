import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import type { SortState } from "../../models/items/SortState";
import SortIcon from "./SortIcon";

interface SortableHeaderProps {
  label: string;
  columnKey: string;
  sortState: SortState | null;
  onSort: (key: string) => void;
  style?: object;
}

const SortableHeader: React.FC<SortableHeaderProps> = (props) => {
  const isActive = props.sortState?.key === props.columnKey;

  return (
    <TouchableOpacity
      onPress={() => props.onSort(props.columnKey)}
      activeOpacity={0.7}
      style={[styles.th, props.style]}
    >
      <View style={[styles.inner, isActive ? styles.innerActive : styles.innerInactive]}>
        <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
          {props.label}
        </Text>
        <SortIcon columnKey={props.columnKey} sortState={props.sortState} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  th: {
    paddingBottom: 12,
    paddingRight: 16,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  innerActive: {
    backgroundColor: "#f5f3ff",
  },
  innerInactive: {
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
  },
  labelActive: {
    color: "#7c3aed",
  },
  labelInactive: {
    color: "#6b7280",
  },
});

export default SortableHeader;