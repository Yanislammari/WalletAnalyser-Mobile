import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMNS = 3;
const GRID_GAP = 16;
const CARD_SIZE = (SCREEN_WIDTH - 32 - GRID_GAP * (COLUMNS - 1)) / COLUMNS;

export const BadgeStyle = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
    justifyContent: "flex-start",
  },
  cardWrapper: { width: CARD_SIZE, alignItems: "center", gap: 6 },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconLocked: {
    backgroundColor: "#F4F4F5",
    borderColor: "#E4E4E7",
    opacity: 0.6,
  },
  cardImage: { width: 40, height: 40 },
  cardEmoji: { fontSize: 28 },
  cardLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },

  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  pillText: { fontSize: 10, fontWeight: "700" },

  tooltip: {
    position: "absolute",
    top: -40,
    backgroundColor: "#18181B",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: 160,
    alignItems: "center",
  },
  tooltipText: { color: "white", fontSize: 11, fontWeight: "500" },
  tooltipArrow: {
    position: "absolute",
    bottom: -4,
    width: 8,
    height: 8,
    backgroundColor: "#18181B",
    transform: [{ rotate: "45deg" }],
  },

  unlockedCount: { textAlign: "center", fontSize: 11, color: "#A1A1AA", marginTop: 24 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  celebrationCard: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 40,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 2,
    minWidth: 260,
  },
  counter: {
    fontSize: 11,
    color: "#A1A1AA",
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  celebrationIcon: {
    width: 96,
    height: 96,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  celebrationImage: { width: 40, height: 40 },
  celebrationTitle: { fontSize: 20, fontWeight: "700" },
  celebrationSubtitle: { fontSize: 13, color: "#71717A", textAlign: "center" },
  tapHint: { fontSize: 11, color: "#A1A1AA", marginTop: 8 },

  noRewardCard: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 40,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#E4E4E7",
    backgroundColor: "white",
    minWidth: 260,
  },
  noRewardTitle: { fontSize: 20, fontWeight: "700", color: "#3F3F46" },
  noRewardSubtitle: { fontSize: 13, color: "#71717A", textAlign: "center" },
  noRewardButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#18181B",
  },
  noRewardButtonText: { color: "white", fontSize: 13, fontWeight: "600" },
});