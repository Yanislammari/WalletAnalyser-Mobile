import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons"

import CompanyFilter from './CompanyFilter';
import DateRangeFilter from './DateRangeFilter';
import Pagination from './Pagination';
import TransactionRow from './TransactionRow';
import SortableHeader from './SortableHeader';
import EmptyTable from './EmptyTable';
import type { AssetBuyResponse } from '../../responses/AssetBuyResponse';
import type { AssetSellResponse } from '../../responses/AssetSellResponse';
import type { AssetDividendResponse } from '../../responses/AssetDividendResponse';
import type { SortState } from '../../models/items/SortState';
import { TABS, tabAccent } from '../../constants/transactionConstants';
import { toggleSort, sortBuys, sortSells, sortDividends } from '../../utils/transactionSort';
import { TabType } from '../../enums/TabType';

const PAGE_SIZE = 10;

interface TransactionTableProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  buys: AssetBuyResponse[];
  sells: AssetSellResponse[];
  dividends: AssetDividendResponse[];
  buyTotal: number;
  sellTotal: number;
  dividendTotal: number;
  buyPage: number;
  sellPage: number;
  dividendPage: number;
  onBuyPageChange: (page: number) => void;
  onSellPageChange: (page: number) => void;
  onDividendPageChange: (page: number) => void;
  loading: boolean;
  onAdd: () => void;
  onDeleteBuy: (id: string) => Promise<void>;
  onDeleteSell: (id: string) => Promise<void>;
  onDeleteDividend: (id: string) => Promise<void>;
  onEditBuy: (row: AssetBuyResponse) => void;
  onEditSell: (row: AssetSellResponse) => void;
  onEditDividend: (row: AssetDividendResponse) => void;
  currencyName: (id: string) => string;
  companies: string[];
  selectedCompany: string | null;
  onCompanyChange: (company: string | null) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  hasAnyBuys: boolean;
  hasAnySells: boolean;
  hasAnyDividends: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = (props) => {
  const [buySortState, setBuySortState] = useState<SortState | null>(null);
  const [sellSortState, setSellSortState] = useState<SortState | null>(null);
  const [dividendSortState, setDividendSortState] = useState<SortState | null>(null);

  const handleBuySort = (key: string) => setBuySortState((prev) => toggleSort(prev, key));
  const handleSellSort = (key: string) => setSellSortState((prev) => toggleSort(prev, key));
  const handleDividendSort = (key: string) => setDividendSortState((prev) => toggleSort(prev, key));

  const sortedBuys = sortBuys(props.buys, buySortState);
  const sortedSells = sortSells(props.sells, sellSortState);
  const sortedDividends = sortDividends(props.dividends, dividendSortState, props.currencyName);

  const isFiltered = !!props.selectedCompany || !!props.dateFrom || !!props.dateTo;

  const tabTotal = (key: TabType) =>
    key === TabType.BUYS ? props.buyTotal
    : key === TabType.SELLS ? props.sellTotal
    : props.dividendTotal;

  return (
    <View style={styles.card}>

      {/* ── Tab bar + filters ── */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {TABS.map((tab) => {
            const active = props.activeTab === tab.key;
            const total = tabTotal(tab.key);
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => props.onTabChange(tab.key)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {total > 0 && (
                  <View style={[styles.badge, active && styles.badgeActive]}>
                    <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
                      {total}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Filters row */}
        <View style={styles.filters}>
          <DateRangeFilter
            from={props.dateFrom}
            to={props.dateTo}
            onFromChange={props.onDateFromChange}
            onToChange={props.onDateToChange}
          />
          <CompanyFilter
            companies={props.companies}
            selected={props.selectedCompany}
            onChange={props.onCompanyChange}
          />
        </View>
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        {props.loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : (
          <>
            {/* BUYS */}
            {props.activeTab === TabType.BUYS && (
              !props.hasAnyBuys && !isFiltered ? (
                <EmptyTable onAdd={props.onAdd} label="buys" />
              ) : props.buys.length === 0 ? (
                <EmptyTable
                  onAdd={props.onAdd}
                  label="buys"
                  filtered={!!props.selectedCompany}
                  dateFiltered={!props.selectedCompany && (!!props.dateFrom || !!props.dateTo)}
                  selectedCompany={props.selectedCompany}
                />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    {/* Header */}
                    <View style={styles.tableHeaderRow}>
                      {['Date', 'Company', 'Shares', 'Price / share', 'Amount'].map((col) => (
                        <SortableHeader
                          key={col}
                          label={col}
                          columnKey={col.toLowerCase().replace(' / ', 'Per').replace(' ', '')}
                          sortState={buySortState}
                          onSort={handleBuySort}
                        />
                      ))}
                      <View style={styles.actionCol} />
                    </View>
                    {/* Rows */}
                    {sortedBuys.map((row) => (
                      <TransactionRow
                        key={row.id}
                        variant="buy"
                        row={row}
                        currencyName={props.currencyName}
                        onDelete={() => props.onDeleteBuy(row.id)}
                        onEdit={props.onEditBuy}
                      />
                    ))}
                    <AddRowButton onPress={props.onAdd} />
                    <Pagination
                      page={props.buyPage}
                      total={props.buyTotal}
                      pageSize={PAGE_SIZE}
                      onChange={props.onBuyPageChange}
                    />
                  </View>
                </ScrollView>
              )
            )}

            {/* SELLS */}
            {props.activeTab === TabType.SELLS && (
              !props.hasAnySells && !isFiltered ? (
                <EmptyTable onAdd={props.onAdd} label="sells" />
              ) : props.sells.length === 0 ? (
                <EmptyTable
                  onAdd={props.onAdd}
                  label="sells"
                  filtered={!!props.selectedCompany}
                  dateFiltered={!props.selectedCompany && (!!props.dateFrom || !!props.dateTo)}
                  selectedCompany={props.selectedCompany}
                />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View style={styles.tableHeaderRow}>
                      {['Date', 'Company', 'Shares', 'Price / share', 'Amount', 'Capital gain'].map((col) => (
                        <SortableHeader
                          key={col}
                          label={col}
                          columnKey={col.toLowerCase().replace(' / ', 'Per').replace(' ', '')}
                          sortState={sellSortState}
                          onSort={handleSellSort}
                        />
                      ))}
                      <View style={styles.actionCol} />
                    </View>
                    {sortedSells.map((row) => (
                      <TransactionRow
                        key={row.id}
                        variant="sell"
                        row={row}
                        currencyName={props.currencyName}
                        onDelete={() => props.onDeleteSell(row.id)}
                        onEdit={props.onEditSell}
                      />
                    ))}
                    <AddRowButton onPress={props.onAdd} />
                    <Pagination
                      page={props.sellPage}
                      total={props.sellTotal}
                      pageSize={PAGE_SIZE}
                      onChange={props.onSellPageChange}
                    />
                  </View>
                </ScrollView>
              )
            )}

            {/* DIVIDENDS */}
            {props.activeTab === TabType.DIVIDENDS && (
              !props.hasAnyDividends && !isFiltered ? (
                <EmptyTable onAdd={props.onAdd} label="dividends" />
              ) : props.dividends.length === 0 ? (
                <EmptyTable
                  onAdd={props.onAdd}
                  label="dividends"
                  dateFiltered={!!props.dateFrom || !!props.dateTo}
                />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View style={styles.tableHeaderRow}>
                      {['Date', 'Company', 'Amount', 'Currency'].map((col) => (
                        <SortableHeader
                          key={col}
                          label={col}
                          columnKey={col.toLowerCase()}
                          sortState={dividendSortState}
                          onSort={handleDividendSort}
                        />
                      ))}
                      <View style={styles.actionCol} />
                    </View>
                    {sortedDividends.map((row) => (
                      <TransactionRow
                        key={row.id}
                        variant="dividend"
                        row={row}
                        currencyName={props.currencyName}
                        onDelete={() => props.onDeleteDividend(row.id)}
                        onEdit={props.onEditDividend}
                      />
                    ))}
                    <AddRowButton onPress={props.onAdd} />
                    <Pagination
                      page={props.dividendPage}
                      total={props.dividendTotal}
                      pageSize={PAGE_SIZE}
                      onChange={props.onDividendPageChange}
                    />
                  </View>
                </ScrollView>
              )
            )}
          </>
        )}
      </View>
    </View>
  );
};

// ── Add row button ─────────────────────────────────────────────────────────────

const AddRowButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.addRowBtn} onPress={onPress}>
    <Ionicons name="add" size={15} color="#7C3AED" />
    <Text style={styles.addRowText}>Add a row</Text>
  </TouchableOpacity>
);

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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

export default TransactionTable;
