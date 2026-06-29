import { Modal, Pressable, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import CompanyLogo from "./CompanyLogo";
import { AssetBuyResponse } from "../../responses/AssetBuyResponse";
import { computeBuyAmount } from "../../utils/transactionSort";
import { useState } from "react";

interface Props {
  detailVisible : boolean,
  onClose : () => void,
  row : AssetBuyResponse,
  currencyName: (id: string) => string,
  onEdit: (row: AssetBuyResponse) => void,
  onDelete: () => void;
}

const ModalDetailBuy : React.FC<Props> = (props) => {
  const formatBuyAmount = (row: AssetBuyResponse, cn: (id: string) => string): string => {
    const amount = computeBuyAmount(row);
    return amount != null ? `${parseFloat(amount.toFixed(2))} ${cn(row.buyCurrencyId)}` : "—";
  };

  const row = props.row
  return (
  <Modal
      visible={props.detailVisible}
      transparent
      animationType="slide"
      onRequestClose={() => props.onClose()}
    >
      <Pressable style={styles.backdrop} onPress={() => props.onClose()}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            {row.companyName && <CompanyLogo name={row.companyName} size={32} />}
            <Text style={styles.sheetTitle}>{row.companyName ?? '—'}</Text>
          </View>

          <View style={styles.sheetDivider} />

          {/* Info rows */}
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{row.buyDate ?? '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Shares</Text>
              <Text style={styles.infoValue}>{row.assetBuyShare ?? '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Price / Share</Text>
              <Text style={styles.infoValue}>{row.assetBuyPricePerShare ?? '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Amount</Text>
              <Text style={[styles.infoValue, { fontWeight: '700', color: '#1D4ED8' }]}>
                {formatBuyAmount(row, props.currencyName)}
              </Text>
            </View>
          </View>

          <View style={styles.sheetDivider} />

          {/* Actions */}
          <View style={styles.sheetActions}>
            <TouchableOpacity
              style={styles.editButton}
              activeOpacity={0.7}
              onPress={() => {
                props.onEdit(row);
              }}
            >
              <Ionicons name="pencil-outline" size={15} color="#7C3AED" />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              activeOpacity={0.7}
              onPress={() => {
                props.onDelete();
              }}
            >
              <Ionicons name="trash-outline" size={15} color="#DC2626" />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  infoGrid: {
    paddingHorizontal: 16,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  editButton: {
    flex: 1,
    flexBasis: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    backgroundColor: '#F5F3FF',
  },
  editText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
  },
  deleteButton: {
    flex: 1,
    flexBasis: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
});

export default ModalDetailBuy;