import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import type { AssetBuyResponse } from "../../responses/AssetBuyResponse";
import type { AssetSellResponse } from "../../responses/AssetSellResponse";
import type { AssetDividendResponse } from "../../responses/AssetDividendResponse";
import DeleteTransactionModal from "./DeleteTransactionModal";
import CompanyLogo from "./CompanyLogo";
import { computeBuyAmount } from "../../utils/transactionSort";

interface BuyRowProps {
  variant: "buy";
  row: AssetBuyResponse;
  currencyName: (id: string) => string;
  onDelete: () => Promise<void>;
  onEdit: (row: AssetBuyResponse) => void;
}

interface SellRowProps {
  variant: "sell";
  row: AssetSellResponse;
  currencyName: (id: string) => string;
  onDelete: () => Promise<void>;
  onEdit: (row: AssetSellResponse) => void;
}

interface DividendRowProps {
  variant: "dividend";
  row: AssetDividendResponse;
  currencyName: (id: string) => string;
  onDelete: () => Promise<void>;
  onEdit: (row: AssetDividendResponse) => void;
}

type TransactionRowProps = BuyRowProps | SellRowProps | DividendRowProps;

const TransactionRow: React.FC<TransactionRowProps> = (props) => {
  const [deleteVisible, setDeleteVisible] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleDeleteClick = () => setDeleteVisible(true);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await props.onDelete();
      setDeleteVisible(false);
      // Replace toast with your RN toast/snackbar solution
    } catch {
      // handle error
    } finally {
      setDeleting(false);
    }
  };

  const ActionButtons = ({ onEditClick }: { onEditClick: () => void }) => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        onPress={onEditClick}
        style={styles.actionBtn}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons name="create-outline" size={16} color="#9ca3af" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleDeleteClick}
        style={styles.actionBtn}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons name="trash-outline" size={16} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );

  const formatBuyAmount = (row: AssetBuyResponse, cn: (id: string) => string): string => {
    const amount = computeBuyAmount(row);
    return amount != null ? `${parseFloat(amount.toFixed(2))} ${cn(row.buyCurrencyId)}` : "—";
  };

  if (props.variant === "buy") {
    const { row, currencyName, onEdit } = props;
    return (
      <>
        <View style={styles.row}>
          <Text style={styles.cellText}>{row.buyDate}</Text>
          <View style={styles.companyCell}>
            {row.companyName && <CompanyLogo name={row.companyName} size={26} />}
            <Text style={styles.companyName}>{row.companyName ?? "—"}</Text>
          </View>
          <Text style={styles.cellText}>{row.assetBuyShare != null ? `${row.assetBuyShare}` : "—"}</Text>
          <Text style={styles.cellText}>{row.assetBuyPricePerShare != null ? `${row.assetBuyPricePerShare}` : "—"}</Text>
          <Text style={styles.cellBold}>{formatBuyAmount(row, currencyName)}</Text>
          <ActionButtons onEditClick={() => onEdit(row)} />
        </View>
        <DeleteTransactionModal
          visible={deleteVisible}
          deleting={deleting}
          onConfirm={handleConfirm}
          onClose={() => setDeleteVisible(false)}
        />
      </>
    );
  }

  if (props.variant === "sell") {
    const { row, currencyName, onEdit } = props;
    const sellPricePerShare: number | null =
      row.assetSellAmount != null && row.assetSellShare != null && row.assetSellShare > 0
        ? parseFloat((row.assetSellAmount / row.assetSellShare).toFixed(4))
        : null;
    const gain = row.assetSellGain;
    return (
      <>
        <View style={styles.row}>
          <Text style={styles.cellText}>{row.sellDate}</Text>
          <View style={styles.companyCell}>
            {row.companyName && <CompanyLogo name={row.companyName} size={26} />}
            <Text style={styles.companyName}>{row.companyName ?? "—"}</Text>
          </View>
          <Text style={styles.cellText}>{row.assetSellShare != null ? row.assetSellShare : "—"}</Text>
          <Text style={styles.cellText}>
            {sellPricePerShare != null ? `${sellPricePerShare} ${currencyName(row.sellCurrencyId)}` : "—"}
          </Text>
          <Text style={styles.cellText}>
            {row.assetSellAmount != null ? `${parseFloat(row.assetSellAmount.toFixed(2))} ${currencyName(row.sellCurrencyId)}` : "—"}
          </Text>
          {gain != null ? (
            <Text style={[styles.cellBold, gain >= 0 ? styles.gainPositive : styles.gainNegative]}>
              {gain >= 0 ? "+" : ""}{gain} {currencyName(row.sellCurrencyId)}
            </Text>
          ) : (
            <Text style={styles.cellText}>—</Text>
          )}
          <ActionButtons onEditClick={() => onEdit(row)} />
        </View>
        <DeleteTransactionModal
          visible={deleteVisible}
          deleting={deleting}
          onConfirm={handleConfirm}
          onClose={() => setDeleteVisible(false)}
        />
      </>
    );
  }

  const { row, currencyName, onEdit } = props;
  const today = new Date().toISOString().split("T")[0];
  const isUpcoming = row.cashflowDate > today;
  return (
    <>
      <View style={[styles.row, isUpcoming && styles.rowUpcoming]}>
        <View style={styles.dateCell}>
          <Text style={styles.cellText}>{row.cashflowDate}</Text>
          {isUpcoming && (
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingBadgeText}>Upcoming</Text>
            </View>
          )}
        </View>
        <View style={styles.companyCell}>
          {row.companyName ? (
            <>
              <CompanyLogo name={row.companyName} size={26} />
              <Text style={[styles.companyName, isUpcoming && styles.companyNameUpcoming]}>
                {row.companyName}
              </Text>
            </>
          ) : (
            <Text style={styles.cellMuted}>—</Text>
          )}
        </View>
        <Text style={[styles.cellBold, isUpcoming ? styles.cellMuted : styles.amountText]}>
          {row.cashflowAmount}
        </Text>
        <Text style={styles.cellText}>{currencyName(row.currencyId)}</Text>
        <ActionButtons onEditClick={() => onEdit(row)} />
      </View>
      <DeleteTransactionModal
        visible={deleteVisible}
        deleting={deleting}
        onConfirm={handleConfirm}
        onClose={() => setDeleteVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  rowUpcoming: {
    opacity: 0.5,
  },
  companyCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 2,
  },
  dateCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  cellText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
  },
  cellBold: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  cellMuted: {
    fontSize: 13,
    color: "#9ca3af",
  },
  companyName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
  },
  companyNameUpcoming: {
    color: "#6b7280",
  },
  gainPositive: {
    color: "#059669",
  },
  gainNegative: {
    color: "#ef4444",
  },
  amountText: {
    color: "#4f46e5",
  },
  upcomingBadge: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  upcomingBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6b7280",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
  },
});

export default TransactionRow;