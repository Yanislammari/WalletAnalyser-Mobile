import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons"
import { toast } from 'sonner-native'; // or your RN toast lib

import PortfolioService from '../services/PortfolioService';
import CurrencyService from '../services/CurrencyService';
import type { Portfolio } from '../models/Portfolio';
import type { Currency } from '../models/Currency';
import type { AssetBuyResponse } from '../responses/AssetBuyResponse';
import type { AssetSellResponse } from '../responses/AssetSellResponse';
import type { AssetDividendResponse } from '../responses/AssetDividendResponse';
import type { PortfolioTotalResponse } from '../responses/PortfolioTotalResponse';
import TransactionTable from '../components/transactions/TransactionTable';
import AddNewBuyModal from '../components/AddNewBuyModal';
import AddNewSellModal from '../components/AddNewSellModal';
import AddNewDividendModal from '../components/AddNewDividendModal';
import { TabType } from '../enums/TabType';
import { PortfolioStackParamList } from '../nav/NavBar';
import { TransactionStyle } from '../styles/Transaction_style'
import BackButton from '../components/button/BackButton';

const PAGE_SIZE = 10;

const PortfolioDetail: React.FC = () => {
  const route = useRoute<RouteProp<PortfolioStackParamList, 'PortfolioDetail'>>();
  const navigation = useNavigation();
  const { id, name } = route.params;

  const portfolioService = PortfolioService.getInstance();
  const currencyService = CurrencyService.getInstance();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [buys, setBuys] = useState<AssetBuyResponse[]>([]);
  const [sells, setSells] = useState<AssetSellResponse[]>([]);
  const [dividends, setDividends] = useState<AssetDividendResponse[]>([]);
  const [buyTotal, setBuyTotal] = useState(0);
  const [sellTotal, setSellTotal] = useState(0);
  const [dividendTotal, setDividendTotal] = useState(0);
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hasAnyBuys, setHasAnyBuys] = useState(false);
  const [hasAnySells, setHasAnySells] = useState(false);
  const [hasAnyDividends, setHasAnyDividends] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [portfolioTotal, setPortfolioTotal] = useState<PortfolioTotalResponse | null>(null);
  const [totalLoading, setTotalLoading] = useState(false);
  const [portfolioNotFound, setPortfolioNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.BUYS);
  const [buyPage, setBuyPage] = useState(1);
  const [sellPage, setSellPage] = useState(1);
  const [dividendPage, setDividendPage] = useState(1);

  // Modal visibility state (replacing dialog refs)
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [dividendModalVisible, setDividendModalVisible] = useState(false);
  const [editBuyModalVisible, setEditBuyModalVisible] = useState(false);
  const [editSellModalVisible, setEditSellModalVisible] = useState(false);
  const [editDividendModalVisible, setEditDividendModalVisible] = useState(false);
  const [editingBuy, setEditingBuy] = useState<AssetBuyResponse | null>(null);
  const [editingSell, setEditingSell] = useState<AssetSellResponse | null>(null);
  const [editingDividend, setEditingDividend] = useState<AssetDividendResponse | null>(null);

  // Load portfolio, currencies, companies
  useEffect(() => {
    if (!id) return;

    const loadStatic = async () => {
      try {
        const [fetchedPortfolio, fetchedCurrencies, fetchedCompanies] = await Promise.all([
          portfolioService.getPortfolioById(id),
          currencyService.getAll(),
          portfolioService.getCompaniesByPortfolioId(id),
        ]);
        setPortfolio(fetchedPortfolio);
        setCurrencies(fetchedCurrencies);
        setCompanies(fetchedCompanies);
      } catch {
        setPortfolioNotFound(true);
      }
    };

    loadStatic();
  }, [id]);

  // Load portfolio total
  useEffect(() => {
    if (!id) return;

    const loadTotal = async () => {
      setTotalLoading(true);
      try {
        const total = await portfolioService.getPortfolioTotal(id);
        setPortfolioTotal(total);
      } catch {
        // non-critical, silently fail
      } finally {
        setTotalLoading(false);
      }
    };

    loadTotal();
  }, [id, reloadTrigger]);

  // Load transactions
  useEffect(() => {
    if (!id) return;

    const loadTransactions = async () => {
      setLoading(true);
      try {
        const [buyResult, sellResult, dividendResult] = await Promise.all([
          portfolioService.getBuysByPortfolioId(id, buyPage, PAGE_SIZE, dateFrom || undefined, dateTo || undefined, selectedCompany || undefined),
          portfolioService.getSellsByPortfolioId(id, sellPage, PAGE_SIZE, dateFrom || undefined, dateTo || undefined, selectedCompany || undefined),
          portfolioService.getDividendsByPortfolioId(id, dividendPage, PAGE_SIZE, dateFrom || undefined, dateTo || undefined, selectedCompany || undefined),
        ]);

        setBuys(buyResult.data);
        setBuyTotal(buyResult.total);
        setSells(sellResult.data);
        setSellTotal(sellResult.total);
        setDividends(dividendResult.data);
        setDividendTotal(dividendResult.total);

        if (!selectedCompany && !dateFrom && !dateTo) {
          setHasAnyBuys(buyResult.total > 0);
          setHasAnySells(sellResult.total > 0);
          setHasAnyDividends(dividendResult.total > 0);
        }
      } catch {
        if (!portfolioNotFound) {
          toast.error('Failed to load transactions.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [id, buyPage, sellPage, dividendPage, selectedCompany, dateFrom, dateTo, reloadTrigger]);

  const handleCompanyChange = (company: string | null) => {
    setBuyPage(1); setSellPage(1); setDividendPage(1);
    setSelectedCompany(company);
  };

  const handleDateFromChange = (value: string) => {
    setBuyPage(1); setSellPage(1); setDividendPage(1);
    setDateFrom(value);
  };

  const handleDateToChange = (value: string) => {
    setBuyPage(1); setSellPage(1); setDividendPage(1);
    setDateTo(value);
  };

  const clampPageAfterDelete = (currentPage: number, currentTotal: number, setPage: (p: number) => void) => {
    const newTotal = currentTotal - 1;
    const maxPage = Math.max(Math.ceil(newTotal / PAGE_SIZE), 1);
    if (currentPage > maxPage) setPage(maxPage);
  };

  const handleDeleteBuy = async (assetId: string) => {
    await portfolioService.deleteAssetBuy(id, assetId);
    clampPageAfterDelete(buyPage, buyTotal, setBuyPage);
    setReloadTrigger((p) => p + 1);
  };

  const handleDeleteSell = async (sellId: string) => {
    await portfolioService.deleteAssetSell(id, sellId);
    clampPageAfterDelete(sellPage, sellTotal, setSellPage);
    setReloadTrigger((p) => p + 1);
  };

  const handleDeleteDividend = async (divId: string) => {
    await portfolioService.deleteAssetDividend(id, divId);
    clampPageAfterDelete(dividendPage, dividendTotal, setDividendPage);
    setReloadTrigger((p) => p + 1);
  };

  const handleEditBuy = (buy: AssetBuyResponse) => {
    setEditingBuy(buy);
    setEditBuyModalVisible(true);
  };

  const handleEditSell = (sell: AssetSellResponse) => {
    setEditingSell(sell);
    setEditSellModalVisible(true);
  };

  const handleEditDividend = (dividend: AssetDividendResponse) => {
    setEditingDividend(dividend);
    setEditDividendModalVisible(true);
  };

  const handleBuySuccess = (buy: AssetBuyResponse) => {
    setHasAnyBuys(true);
    if (buy.companyName && !companies.includes(buy.companyName)) {
      setCompanies((prev) => [...prev, buy.companyName!].sort());
    }
    setReloadTrigger((p) => p + 1);
  };

  const handleSellSuccess = (sell: AssetSellResponse) => {
    setHasAnySells(true);
    if (sell.companyName && !companies.includes(sell.companyName)) {
      setCompanies((prev) => [...prev, sell.companyName!].sort());
    }
    setReloadTrigger((p) => p + 1);
  };

  const handleDividendSuccess = () => {
    setHasAnyDividends(true);
    setReloadTrigger((p) => p + 1);
  };

  const openModal = () => {
    if (activeTab === TabType.BUYS) setBuyModalVisible(true);
    else if (activeTab === TabType.SELLS) setSellModalVisible(true);
    else setDividendModalVisible(true);
  };

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const pnl = portfolioTotal
    ? portfolioTotal.totalValue - portfolioTotal.totalInvested
    : null;

  if (portfolioNotFound) {
    return (
      <View style={TransactionStyle.centered}>
        <Text style={TransactionStyle.notFoundText}>Portfolio not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={TransactionStyle.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={TransactionStyle.container} contentContainerStyle={TransactionStyle.content}>

      {/* Header row */}
      <View style={TransactionStyle.headerRow}>
        <View style={TransactionStyle.headerLeft}>
          <BackButton route='PortfolioList'/>
          <View>
            <Text style={TransactionStyle.title}>{name ?? '…'}</Text>
            <Text style={TransactionStyle.subtitle}>Enter your transactions.</Text>
          </View>
        </View>
        <TouchableOpacity style={TransactionStyle.addButton} onPress={openModal}>
          <Ionicons name="add" size={15} color="#fff" />
          <Text style={TransactionStyle.addButtonText}>Add a row</Text>
        </TouchableOpacity>
      </View>

      {/* Portfolio Summary Card */}
      <View style={TransactionStyle.card}>
        <View style={TransactionStyle.cardHeader}>
          <Text style={TransactionStyle.cardTitle}>Portfolio Summary</Text>
          {portfolio?.displayCurrencyName && (
            <View style={TransactionStyle.currencyBadge}>
              <Text style={TransactionStyle.currencyBadgeText}>{portfolio.displayCurrencyName}</Text>
            </View>
          )}
        </View>

        {totalLoading ? (
          <View style={TransactionStyle.grid}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={[TransactionStyle.summaryCell, { backgroundColor: '#F3F4F6' }]} />
            ))}
          </View>
        ) : (
          <View style={TransactionStyle.grid}>
            <SummaryCell
              label="Invested"
              value={portfolioTotal ? fmt(portfolioTotal.totalInvested) : '—'}
              currency={portfolioTotal?.currencyName}
            />
            <SummaryCell
              label="Sells"
              value={portfolioTotal ? fmt(portfolioTotal.totalSells) : '—'}
              currency={portfolioTotal?.currencyName}
            />
            <SummaryCell
              label="Dividends"
              value={portfolioTotal ? fmt(portfolioTotal.totalDividends) : '—'}
              currency={portfolioTotal?.currencyName}
            />
            <SummaryCell
              label="Portfolio Value"
              value={portfolioTotal ? fmt(portfolioTotal.portfolioMarketValue) : '—'}
              currency={portfolioTotal?.currencyName}
              valueColor="#1D4ED8"
              bg="#EFF6FF"
              note="Value of held positions"
            />
            <SummaryCell
              label="Total Value"
              value={portfolioTotal ? fmt(portfolioTotal.totalValue) : '—'}
              currency={portfolioTotal?.currencyName}
              valueColor="#7C3AED"
              bg="#F5F3FF"
              note="Portfolio value + Sells + Dividends"
            />
            <SummaryCell
              label="Total P&L"
              value={pnl != null ? (pnl >= 0 ? '+' : '') + fmt(pnl) : '—'}
              currency={portfolioTotal?.currencyName}
              valueColor={pnl != null && pnl >= 0 ? '#15803D' : '#DC2626'}
              bg={pnl != null && pnl >= 0 ? '#F0FDF4' : '#FEF2F2'}
              note="Including unrealized gains"
            />
          </View>
        )}
      </View>

      {/* Transaction Table */}
      <TransactionTable
        activeTab={activeTab}
        onTabChange={setActiveTab}
        buys={buys}
        sells={sells}
        dividends={dividends}
        buyTotal={buyTotal}
        sellTotal={sellTotal}
        dividendTotal={dividendTotal}
        buyPage={buyPage}
        sellPage={sellPage}
        dividendPage={dividendPage}
        onBuyPageChange={setBuyPage}
        onSellPageChange={setSellPage}
        onDividendPageChange={setDividendPage}
        loading={loading}
        onAdd={openModal}
        onDeleteBuy={handleDeleteBuy}
        onDeleteSell={handleDeleteSell}
        onDeleteDividend={handleDeleteDividend}
        onEditBuy={handleEditBuy}
        onEditSell={handleEditSell}
        onEditDividend={handleEditDividend}
        currencyName={(uuid : string) => currencies.find((c) => c.uuid === uuid)?.currencyName ?? uuid}
        companies={companies}
        selectedCompany={selectedCompany}
        onCompanyChange={handleCompanyChange}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        hasAnyBuys={hasAnyBuys}
        hasAnySells={hasAnySells}
        hasAnyDividends={hasAnyDividends}
      />

      {/* Modals */}
      {id && (
        <>
          <AddNewBuyModal
            visible={buyModalVisible}
            onClose={() => setBuyModalVisible(false)}
            currencies={currencies}
            portfolioId={id}
            onSuccess={handleBuySuccess}
          />
          <AddNewSellModal
            visible={sellModalVisible}
            onClose={() => setSellModalVisible(false)}
            currencies={currencies}
            portfolioId={id}
            ownedCompanies={companies}
            onSuccess={handleSellSuccess}
          />
          <AddNewDividendModal
            visible={dividendModalVisible}
            onClose={() => setDividendModalVisible(false)}
            currencies={currencies}
            portfolioId={id}
            onSuccess={handleDividendSuccess}
          />
          <AddNewBuyModal
            visible={editBuyModalVisible}
            onClose={() => setEditBuyModalVisible(false)}
            currencies={currencies}
            portfolioId={id}
            onSuccess={() => setReloadTrigger((p) => p + 1)}
            editTransaction={editingBuy ?? undefined}
          />
          <AddNewSellModal
            visible={editSellModalVisible}
            onClose={() => setEditSellModalVisible(false)}
            currencies={currencies}
            portfolioId={id}
            ownedCompanies={companies}
            onSuccess={() => setReloadTrigger((p) => p + 1)}
            editTransaction={editingSell ?? undefined}
          />
          <AddNewDividendModal
            visible={editDividendModalVisible}
            onClose={() => setEditDividendModalVisible(false)}
            currencies={currencies}
            portfolioId={id}
            onSuccess={() => setReloadTrigger((p) => p + 1)}
            editTransaction={editingDividend ?? undefined}
          />
        </>
      )}
    </ScrollView>
  );
};

interface SummaryCellProps {
  label: string;
  value: string;
  currency?: string;
  valueColor?: string;
  bg?: string;
  note?: string;
}

const SummaryCell: React.FC<SummaryCellProps> = ({
  label, value, currency, valueColor = '#111827', bg = '#F9FAFB', note,
}) => (
  <View style={[TransactionStyle.summaryCell, { backgroundColor: bg }]}>
    <Text style={TransactionStyle.summaryCellLabel}>{label}</Text>
    <Text style={[TransactionStyle.summaryCellValue, { color: valueColor }]}>
      {value}
      {currency ? <Text style={TransactionStyle.summaryCellCurrency}> {currency}</Text> : null}
    </Text>
    {note ? <Text style={TransactionStyle.summaryCellNote}>{note}</Text> : null}
  </View>
);

export default PortfolioDetail;
