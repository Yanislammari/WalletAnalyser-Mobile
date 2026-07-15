import { useState } from "react";
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  StyleSheet,
  Pressable
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { usePortfolio } from "../providers/PortfolioProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SideMenu from "./SideMenu";
import { C } from "../utils/color";
import { truncate } from "../utils/truncate";

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
          <Icon name="menu-outline" size={26} color={C.white} />
        </TouchableOpacity>

        <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

        {/* Portfolio switcher */}
        { showChoice && 
          <View style={styles.switcherWrapper}>
            <Pressable
              style={styles.switcher}
              onPress={() => setModalVisible(true)}
              android_ripple={{ color: C.purple100, borderless: false }}
            >
              <View style={styles.switcherIcon}>
                <Icon name="briefcase-outline" size={15} color={C.indigo700} />
              </View>
              <Text style={styles.switcherText} numberOfLines={1}>
                {selectedPortfolio?.name ?? "Select portfolio"}
              </Text>
              <Icon
                name={modalVisible ? "chevron-up" : "chevron-down"}
                size={15}
                color="black"
              />
            </Pressable>
          </View>
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
                  <Pressable
                    style={[styles.option, isActive && styles.optionActive]}
                    onPress={() => {
                      setSelectedPortfolio(item);
                      setModalVisible(false);
                    }}
                    android_ripple={{ color: C.purple100 }}
                  >
                    <Icon name="briefcase-outline" size={15} color={isActive ? C.indigo700 : "#6b7280"} />
                    <Text style={[styles.optionText, isActive && styles.optionTextActive]} numberOfLines={1}>
                      {truncate(item.name, 10)}
                    </Text>
                    {isActive && <Icon name="checkmark" size={15} color="#7c3aed" />}
                  </Pressable>
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
    backgroundColor : C.indigo700,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  iconBtn: {
    padding: 4,
  },
  switcherWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "flex-start",
    minWidth: 180,
    borderWidth: 1,
    borderColor: C.purple100,
  },
  switcher: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: C.white,
  },
  switcherIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.purple100,
    alignItems: "center",
    justifyContent: "center",
  },
  switcherText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "black",
  },
  backdrop: { flex: 1 },
  dropdown: {
    position: "absolute",
    right: 16,
    top: 70,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 4,
    minWidth: 200,
    maxHeight: 280,
    shadowColor: "black",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 1,
    borderColor: C.purple100,
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