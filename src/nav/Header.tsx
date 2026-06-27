import { useState } from "react";
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  StyleSheet
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { usePortfolio } from "../providers/PortfolioProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SideMenu from "./SideMenu";

interface Props {
  showChoice?: boolean;
}

export default function Header({ showChoice = true } : Props) {
  const { selectedPortfolio, portfolios, setSelectedPortfolio } = usePortfolio();
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>

        {/* Burger */}
        <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)}>
          <Icon name="menu-outline" size={26} color="#111827" />
        </TouchableOpacity>

        <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

        {/* Portfolio switcher */}
        { showChoice && 
          <TouchableOpacity
            style={styles.switcher}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.switcherIcon}>
              <Icon name="briefcase-outline" size={15} color="#7c3aed" />
            </View>
            <Text style={styles.switcherText} numberOfLines={1}>
              {selectedPortfolio?.name ?? "Select portfolio"}
            </Text>
            <Icon
              name={modalVisible ? "chevron-up" : "chevron-down"}
              size={15}
              color="#9ca3af"
            />
          </TouchableOpacity>
        }
      </View>

      {/* Dropdown */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.dropdown}>
            <FlatList
              data={portfolios}
              keyExtractor={(item) => item.id}
              scrollEnabled={portfolios.length > 6}
              renderItem={({ item }) => {
                const isActive = item.id === selectedPortfolio?.id;
                return (
                  <TouchableOpacity
                    style={[styles.option, isActive && styles.optionActive]}
                    onPress={() => {
                      setSelectedPortfolio(item);
                      setModalVisible(false);
                    }}
                  >
                    <Icon name="briefcase-outline" size={15} color={isActive ? "#7c3aed" : "#6b7280"} />
                    <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                      {item.name}
                    </Text>
                    {isActive && <Icon name="checkmark" size={15} color="#7c3aed" />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",  // ← burger left, switcher right
    paddingHorizontal: 16,
    paddingVertical: 8,               // ← less vertical padding = less tall
  },
  iconBtn: {
    padding: 4,
  },
  switcher: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",           // ← black-ish edge
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
    maxWidth: 200,
  },
  switcherIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#f5f3ff",       // ← violet tinted background
    alignItems: "center",
    justifyContent: "center",
  },
  switcherText: {
    flex: 1,
    fontSize: 14,                     // ← bigger
    fontWeight: "600",
    color: "#111827",                 // ← dark text on white background
  },
  backdrop: { flex: 1 },
  dropdown: {
    position: "absolute",
    right: 16,
    top: 70,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 4,
    minWidth: 200,
    maxHeight: 280,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionActive: { backgroundColor: "#f5f3ff" },
  optionText: { flex: 1, fontSize: 14, color: "#374151" },
  optionTextActive: { color: "#7c3aed", fontWeight: "600" },
});