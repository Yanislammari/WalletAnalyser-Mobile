import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import type { SortState } from "../../models/items/SortState";
import { SortDir } from "../../enums/SortDir";
import { StyleSheet, View } from "react-native";

interface SortIconProps {
  columnKey: string;
  sortState: SortState | null;
}

const SortIcon: React.FC<SortIconProps> = (props) => {
  const isActive = props.sortState?.key === props.columnKey;

  if (!isActive) {
    return (
      <View style={styles.pillInactive}>
        <Ionicons name="chevron-expand" size={10} color="#9CA3AF" />
      </View>
    );
  }

  const isAsc = props.sortState!.dir === SortDir.ASC;

  return (
    <View style={styles.pillActive}>
      <Ionicons
        name={isAsc ? "arrow-up" : "arrow-down"}
        size={10}
        color="#7C3AED"
      />
    </View>
  );
};

export default SortIcon;

const styles = StyleSheet.create({
  pillInactive: {
    marginLeft: 4,
    borderRadius: 6,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    marginLeft: 4,
    borderRadius: 6,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});