import { StyleSheet } from "react-native";
import { C } from "../utils/color";

export const PORTFOLIO_COLORS = [
  "#7c3aed", // purple
  "#2563eb", // blue
  "#059669", // green
  "#d97706", // amber
  "#dc2626", // red
  "#0891b2", // cyan
];

export const stylesPortfolio = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb", paddingVertical : 16 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#7c3aed", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  searchRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: C.gray300 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 42, color: "black", fontSize: 14 },
  loader: { marginTop: 60 },
  list: { paddingBottom: 16 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: "#f5f3ff", alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#374151" },
  emptySubtitle: { fontSize: 13, color: "#9ca3af" },
  noResults: { fontSize: 13, color: "#6b7280", marginTop: 8 },
  pagination: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, paddingVertical: 8 },
  pageBtn: { padding: 8, borderRadius: 8, backgroundColor: "#f3f4f6" },
  pageBtnDisabled: { opacity: 0.4 },
  pageText: { fontSize: 14, color: "#374151", fontWeight: "500" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modal: { backgroundColor: "#fff", borderRadius: 20, padding: 24, width: "85%", gap: 16 },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  modalInput: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#111827" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: "#f3f4f6" },
  cancelText: { fontSize: 14, color: "#374151", fontWeight: "500" },
  createBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: "#7c3aed" },
  createText: { fontSize: 14, color: "#fff", fontWeight: "600" },
  currencyLabel: { fontSize: 13, fontWeight: "600", color: "#374151" },
  currencyScroll: { marginVertical: 4 },
  currencyList: { gap: 8, paddingVertical: 4 },
  currencyChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1,
    borderColor: "#e5e7eb", backgroundColor: "#f9fafb",
  },
  currencyChipActive: { backgroundColor: "#7c3aed", borderColor: "#7c3aed" },
  currencyChipText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  currencyChipTextActive: { color: "#fff" },
  createBtnDisabled: { opacity: 0.5 },
});