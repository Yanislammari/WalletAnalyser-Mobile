import React from "react";
import { View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import type { SortState } from "../../models/items/SortState";
import { SortDir } from "../../enums/SortDir";

interface SortIconProps {
  columnKey: string;
  sortState: SortState | null;
}

const SortIcon: React.FC<SortIconProps> = (props) => {
  if (props.sortState?.key !== props.columnKey) {
    return (
      <View style={{ marginLeft: 2, gap: 1, opacity: 0.3 }}>
        <Ionicons name="arrow-up-outline" size={9} color="#6b7280" />
        <Ionicons name="arrow-down-outline" size={9} color="#6b7280" />
      </View>
    );
  }

  return props.sortState.dir === SortDir.ASC
    ? <Ionicons name="arrow-up-outline" size={11} color="#7c3aed" style={{ marginLeft: 4 }} />
    : <Ionicons name="arrow-down-outline" size={11} color="#7c3aed" style={{ marginLeft: 4 }} />;
};

export default SortIcon;