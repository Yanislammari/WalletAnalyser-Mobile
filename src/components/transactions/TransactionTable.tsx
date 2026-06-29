import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
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
import { TABS } from '../../constants/transactionConstants';
import { toggleSort, sortBuys, sortSells, sortDividends } from '../../utils/transactionSort';
import { TabType } from '../../enums/TabType';
import { transactionTableStyle } from '../../styles/transaction/transactionTableStyle';

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

  const BUY_COLS = [
    { label: 'Date',    key: 'date',    width: 90  },
    { label: 'Company', key: 'company', width: 120 },
    { label: 'Amount',  key: 'amount',  width: 110 },
  ];

  const SELL_COLS = [
    { label: 'Date',    key: 'date',    width: 90  },
    { label: 'Company', key: 'company', width: 120 },
    { label: 'Gain',  key: 'gain',  width: 90 },
  ];

  return (
    <View style={transactionTableStyle.card}>

      {/* ── Tab bar + filters ── */}
      <View style={transactionTableStyle.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={transactionTableStyle.tabs}>
          {TABS.map((tab) => {
            const active = props.activeTab === tab.key;
            const total = tabTotal(tab.key);
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => props.onTabChange(tab.key)}
                style={[transactionTableStyle.tab, active && transactionTableStyle.tabActive]}
              >
                <Text style={[transactionTableStyle.tabLabel, active && transactionTableStyle.tabLabelActive]}>
                  {tab.label}
                </Text>
                {total > 0 && (
                  <View style={[transactionTableStyle.badge, active && transactionTableStyle.badgeActive]}>
                    <Text style={[transactionTableStyle.badgeText, active && transactionTableStyle.badgeTextActive]}>
                      {total}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Filters row */}
        <View style={transactionTableStyle.filters}>
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
      <View style={transactionTableStyle.content}>
        {props.loading ? (
          <View style={transactionTableStyle.loadingContainer}>
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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {BUY_COLS.map((col) => (
                        <SortableHeader
                          key={col.key}
                          label={col.label}
                          columnKey={col.key}
                          sortState={buySortState}
                          onSort={handleBuySort}
                          style={{ width: col.width }}
                        />
                      ))}
                      <View style={{ width: 16}} />
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
                    <View style={transactionTableStyle.tableHeaderRow}>
                      {SELL_COLS.map((col) => (
                        <SortableHeader
                          key={col.key}
                          label={col.label}
                          columnKey={col.key}
                          sortState={sellSortState}
                          onSort={handleSellSort}
                          style={{ width: col.width }}
                        />
                      ))}
                      <View style={transactionTableStyle.actionCol} />
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
                    <View style={transactionTableStyle.tableHeaderRow}>
                      {BUY_COLS.map((col) => (
                        <SortableHeader
                          key={col.key}
                          label={col.label}
                          columnKey={col.key}
                          sortState={dividendSortState}
                          onSort={handleDividendSort}
                          style={{ width: col.width }}
                        />
                      ))}
                      <View style={{ width: 16}} />
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
  <TouchableOpacity style={transactionTableStyle.addRowBtn} onPress={onPress}>
    <Ionicons name="add" size={15} color="#7C3AED" />
    <Text style={transactionTableStyle.addRowText}>Add a row</Text>
  </TouchableOpacity>
);

// ── Styles ─────────────────────────────────────────────────────────────────────



export default TransactionTable;
