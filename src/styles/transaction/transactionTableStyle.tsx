import { StyleSheet } from "react-native";

export const transactionTableStyle = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    overflow: 'hidden',
  },

  // Tab bar
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabs: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 4,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabLabel: { fontSize: 13, fontWeight: '500', color: '#9CA3AF' },
  tabLabelActive: { color: '#111827' },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  badgeActive: { backgroundColor: '#EDE9FE' },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#6B7280' },
  badgeTextActive: { color: '#7C3AED' },

  // Filters
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // Content
  content: { padding: 12 },
  loadingContainer: { paddingVertical: 40, alignItems: 'center' },

  // Table
  tableHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  actionCol: { width: 48 },

  // Add row
  addRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  addRowText: { fontSize: 13, fontWeight: '600', color: '#7C3AED' },
});