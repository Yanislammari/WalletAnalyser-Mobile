import { StyleSheet } from "react-native";
import { C } from "../utils/color";

export const dashboardStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  screenContent: { padding: 16, gap: 20, paddingBottom: 40 },

  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  title: { color: C.gray900, fontSize: 20, fontWeight: "700" },
  subtitle: { color: C.gray500, fontSize: 13, marginTop: 2 },

  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: "47%",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray100,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  statSkeleton: { width: "47%", height: 96 },

  panelCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray100,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  chartSkeleton: { height: 208 },
  breakdownSkeleton: { height: 200 },
  stripSkeleton: { height: 80 },
  stripLabel: { color: C.gray400, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontWeight: "500", marginBottom: 2 },

  // Styles Pro / Lock Section
  proLockContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  proLockLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  proIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.purple50,
    alignItems: "center",
    justifyContent: "center",
  },
  proTextContainer: {
    flex: 1,
  },
  proSubtitle: {
    color: C.gray500,
    fontSize: 11,
    marginTop: 2,
  },
  proUpgradeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: C.purple600,
    borderRadius: 12,
  },
  proUpgradeButtonText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "600",
  },

  noTxnBox: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray100,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  noTxnTitle: { color: C.gray600, fontWeight: "600", fontSize: 15 },
  noTxnSubtitle: { color: C.gray400, fontSize: 13, marginTop: 4, textAlign: "center" },
  noTxnButton: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.purple600, borderRadius: 12 },
  noTxnButtonText: { color: C.white, fontSize: 13, fontWeight: "600" },

  skeleton: { backgroundColor: C.gray100, borderRadius: 12 },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingBottom: 12,
    marginBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.gray100,
  },
  panelTitle: {
    color: C.gray900,
    fontSize: 14,
    fontWeight: "700",
  },
  panelPeriod: {
    color: C.gray400,
    fontSize: 11,
    fontWeight: "500",
  },
});