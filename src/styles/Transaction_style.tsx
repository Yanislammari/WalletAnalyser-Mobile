import { StyleSheet } from "react-native";

export const TransactionStyle = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, gap: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  notFoundText: { fontSize: 16, color: '#374151' },
  backLink: { color: '#7C3AED', fontSize: 14 },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  backButton: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  addButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: '#7C3AED', borderRadius: 12,
  },
  addButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  currencyBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: '#F5F3FF', borderRadius: 8,
    borderWidth: 1, borderColor: '#DDD6FE',
  },
  currencyBadgeText: { fontSize: 11, fontWeight: '600', color: '#7C3AED' },

  // Summary grid — 2 columns
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  summaryCell: {
    width: '47%', borderRadius: 12, padding: 12, minHeight: 56,
  },
  summaryCellLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  summaryCellValue: { fontSize: 17, fontWeight: '700' },
  summaryCellCurrency: { fontSize: 11, fontWeight: '500', color: '#9CA3AF' },
  summaryCellNote: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
});