import { Modal, Pressable, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import CompanyLogo from "./CompanyLogo";
import { AssetSellResponse } from "../../responses/AssetSellResponse";

interface Props {
  detailVisible: boolean;
  onClose: () => void;
  row: AssetSellResponse;
  currencyName: (id: string) => string;
  onEdit: (row: AssetSellResponse) => void;
  onDelete: () => void;
}

const ModalDetailSell: React.FC<Props> = (props) => {
  const row = props.row;
  const cn = props.currencyName(row.sellCurrencyId);

  const fmt = (val: number | null) =>
    val != null ? `${parseFloat(val.toFixed(2))} ${cn}` : '—';

  const gainColor = row.assetSellGain != null
    ? row.assetSellGain >= 0 ? '#15803D' : '#DC2626'
    : '#111827';

  const gainBg = row.assetSellGain != null
    ? row.assetSellGain >= 0 ? '#F0FDF4' : '#FEF2F2'
    : 'transparent';

  return (
    <Modal
      visible={props.detailVisible}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}
    >
      <Pressable style={styles.backdrop} onPress={props.onClose}>
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
              <Text style={styles.infoValue}>{row.sellDate ?? '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Shares sold</Text>
              <Text style={styles.infoValue}>{row.assetSellShare ?? '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Avg buy price</Text>
              <Text style={styles.infoValue}>
                {row.averageAssetShareBuyPrice != null
                  ? `${parseFloat(row.averageAssetShareBuyPrice.toFixed(4))} ${cn}`
                  : '—'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total amount</Text>
              <Text style={[styles.infoValue, { color: '#1D4ED8', fontWeight: '700' }]}>
                {fmt(row.assetSellAmount)}
              </Text>
            </View>
            <View style={[styles.infoRow, { backgroundColor: gainBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 }]}>
              <Text style={styles.infoLabel}>Gain / Loss</Text>
              <Text style={[styles.infoValue, { color: gainColor, fontWeight: '700' }]}>
                {row.assetSellGain != null
                  ? `${row.assetSellGain >= 0 ? '+' : ''}${parseFloat(row.assetSellGain.toFixed(2))} ${cn}`
                  : '—'}
              </Text>
            </View>
          </View>

          <View style={styles.sheetDivider} />

          {/* Actions */}
          <View style={styles.sheetActions}>
            <TouchableOpacity
              style={styles.editButton}
              activeOpacity={0.7}
              onPress={() => props.onEdit(row)}
            >
              <Ionicons name="pencil-outline" size={15} color="#7C3AED" />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              activeOpacity={0.7}
              onPress={props.onDelete}
            >
              <Ionicons name="trash-outline" size={15} color="#DC2626" />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

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

export default ModalDetailSell;