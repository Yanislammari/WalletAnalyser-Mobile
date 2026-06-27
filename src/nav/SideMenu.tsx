import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../providers/AuthProvider";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.72;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SideMenu({ visible, onClose }: Props) {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  const menuItems = [
    {
      label: "Sign out",
      icon: "log-out-outline",
      color: "#ef4444",
      onPress: async () => {
        onClose();
        logout();
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      },
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        {/* Drawer */}
        <View style={styles.drawer}>

          {/* Violet title banner */}
          <View style={styles.banner}>
            <Text style={styles.bannerText}>WalletAnalyser</Text>
          </View>

          {/* User bubble */}
          <View style={styles.userSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || "?"}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Nav items */}
          <View style={styles.menuList}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={[styles.menuIconBox, { backgroundColor: item.color + "18" }]}>
                  <Icon name={item.icon} size={18} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, { color: item.color }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: "#fff",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 0,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 4, height: 0 },
    elevation: 10,
    overflow: "hidden",
  },
  banner: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  bannerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 36,          // ← smaller
    height: 36,
    borderRadius: 18,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 13,       // ← smaller
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,       // ← smaller
    fontWeight: "700",
    color: "#111827",
  },
  userEmail: {
    fontSize: 11,       // ← smaller
    color: "#9ca3af",
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginBottom: 16,
    marginHorizontal: 20,
  },
  menuList: {
    gap: 4,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});