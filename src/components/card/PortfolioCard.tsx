import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { Portfolio } from "../../models/Portfolio";
import PortfolioService from "../../services/PortfolioService";
import { toast } from "sonner-native";

interface Props {
  portfolio: Portfolio;
  onDelete: (portfolioId: string) => void;
  color : string;
}

export default function PortfolioCard({ portfolio, onDelete, color }: Props) {
  const navigation = useNavigation<any>();
  const portfolioService = PortfolioService.getInstance();

  const [assetCount, setAssetCount] = useState<number | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loadingCount, setLoadingCount] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    portfolioService
      .getAssetCountByPortfolioId(portfolio.id)
      .then(({ total }) => setAssetCount(total))
      .catch(() => setAssetCount(0));
  }, [portfolio.id]);

  const handleDeletePress = async () => {
    setLoadingCount(true);
    try {
      setDeleteModalVisible(true);
    } catch {
      toast.error("Can't delete this portfolio try again later")
    } finally {
      setLoadingCount(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await portfolioService.deletePortfolio(portfolio.id);
      setDeleteModalVisible(false);
      onDelete(portfolio.id);
    } catch(e : any) {
      console.log(e)
      toast.error("Can't delete this portfolio try again later")
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        //onPress={() => navigation.navigate("AnalysisDetail", { id: portfolio.id })}
        activeOpacity={0.85}
      >
        {/* Icon + Delete */}
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: color }]}>
            <Icon name="briefcase-outline" size={24} color='#fff' />
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDeletePress}
            disabled={loadingCount}
          >
            {loadingCount
              ? <ActivityIndicator size="small" color="#f87171" />
              : <Icon name="trash-outline" size={18} color="#f87171" />}
          </TouchableOpacity>
        </View>

        {/* Name */}
        <Text style={styles.name} numberOfLines={1}>{portfolio.name}</Text>

        {/* Created at */}
        <Text style={styles.date}>
          Created {new Date(portfolio.createdAt).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.assetCount}>
              {assetCount === null ? "— assets" : `${assetCount} ${assetCount === 1 ? "asset" : "assets"}`}
            </Text>
            {portfolio.displayCurrencyName && (
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyText}>{portfolio.displayCurrencyName}</Text>
              </View>
            )}
          </View>
          <Text style={styles.open}>Open →</Text>
        </View>
      </TouchableOpacity>

      {/* Delete confirmation modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Delete "{portfolio.name}"?</Text>
            <Text style={styles.modalSubtitle}>
              This portfolio contains{" "}
              <Text style={{ fontWeight: "700" }}>
                {assetCount ?? 0} {assetCount === 1 ? "asset" : "assets"}
              </Text>
              . This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.confirmText}>Delete</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  iconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: "#7c3aed",
    alignItems: "center", justifyContent: "center",
  },
  deleteBtn: { padding: 6 },
  name: { fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 4 },
  date: { fontSize: 12, color: "#9ca3af", marginBottom: 12 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f3f4f6", paddingTop: 10 },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  assetCount: { fontSize: 11, color: "#9ca3af", fontWeight: "500" },
  currencyBadge: { backgroundColor: "#f5f3ff", borderWidth: 1, borderColor: "#e9d5ff", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  currencyText: { fontSize: 10, color: "#7c3aed", fontWeight: "600" },
  open: { fontSize: 11, color: "#7c3aed", fontWeight: "500" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modal: { backgroundColor: "#fff", borderRadius: 20, padding: 24, width: "85%", gap: 12 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  modalSubtitle: { fontSize: 13, color: "#6b7280", lineHeight: 20 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 4 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: "#f3f4f6" },
  cancelText: { fontSize: 14, color: "#374151", fontWeight: "500" },
  confirmBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: "#ef4444" },
  confirmText: { fontSize: 14, color: "#fff", fontWeight: "600" },
});