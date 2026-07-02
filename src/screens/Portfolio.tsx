import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  Modal, ActivityIndicator,
  ScrollView
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../providers/AuthProvider";
import PortfolioService from "../services/PortfolioService";
import PortfolioCard from "../components/card/PortfolioCard";
import type { Portfolio } from "../models/Portfolio";
import CurrencyService from "../services/CurrencyService";
import type { Currency } from "../models/Currency";
import { PORTFOLIO_COLORS, stylesPortfolio } from "../styles/Portfolio_style";
import { toast } from "sonner-native";
import { usePortfolio } from "../providers/PortfolioProvider";
import ErrorCardInApp from "../components/card/ErrorCard";
import { RouteProp, useRoute } from "@react-navigation/native";
import { PortfolioStackParamList } from "../nav/NavBar";

const PAGE_SIZE = 9;

const Portfolios : React.FC = () => {
  const { user } = useAuth();
  const { refresh } = usePortfolio();
  const portfolioService = PortfolioService.getInstance();
  const route = useRoute<RouteProp<PortfolioStackParamList, 'PortfolioList'>>();
  const { openModal } = route.params;

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(openModal ?? false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [newCurrencyId, setNewCurrencyId] = useState<string>("");
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    CurrencyService.getInstance().getAll().then(setCurrencies).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await portfolioService.getPortfoliosByUserId(
          user.id, page, PAGE_SIZE, debouncedSearch || undefined
        );
        setPortfolios(result.data);
        setTotal(result.total);
      } catch {
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, page, debouncedSearch, reloadTrigger]);

  const handleCreate = async () => {
    if (!newName.trim() || !newCurrencyId || !user) return;
    setCreating(true);
    try {
      await portfolioService.createPortfolio({
        userId: user.id,
        name: newName.trim(),
        displayCurrencyId: newCurrencyId,   // ← added
      });
      setModalVisible(false);
      setNewName("");
      setNewCurrencyId("");
      setTotal((t) => t + 1);
      setReloadTrigger((r) => r + 1);
      refresh();
    } catch {
      toast.error("Can't create the portfolio try again later")
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = () => {
    setTotal((t) => t - 1);
    setReloadTrigger((r) => r + 1);
  };

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const noResults = !loading && total === 0;

  if (hasError) {
    return (
      <ErrorCardInApp
        iconBg="#F3F4F6"
        icon={<Icon name="close-circle-outline" size={32} color="#9CA3AF" />}
        title="Can't fetch portfolios"
        description="An error has occured try again later"
      />
    );
  }

  return (
    <View style={stylesPortfolio.safe}>
      <View style={stylesPortfolio.container}>
        {/* Header */}
        <View style={stylesPortfolio.header}>
          <View>
            <Text style={stylesPortfolio.title}>My Portfolios</Text>
            <Text style={stylesPortfolio.subtitle}>Manage your investment portfolios.</Text>
          </View>
          <TouchableOpacity style={stylesPortfolio.addBtn} onPress={() => setModalVisible(true)}>
            <Icon name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={stylesPortfolio.searchRow}>
          <Icon name="search-outline" size={16} color="#9ca3af" style={stylesPortfolio.searchIcon} />
          <TextInput
            style={stylesPortfolio.searchInput}
            placeholder="Search portfolios…"
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Content */}
        {loading ? (
          <ActivityIndicator size="large" color="#7c3aed" style={stylesPortfolio.loader} />
        ) : noResults && !debouncedSearch ? (
          // Empty state
          <View style={stylesPortfolio.emptyState}>
            <View style={stylesPortfolio.emptyIcon}>
              <Icon name="briefcase-outline" size={36} color="#a78bfa" />
            </View>
            <Text style={stylesPortfolio.emptyTitle}>No portfolios yet</Text>
            <Text style={stylesPortfolio.emptySubtitle}>Create your first portfolio to start tracking.</Text>
            <TouchableOpacity style={stylesPortfolio.addBtn} onPress={() => setModalVisible(true)}>
              <Icon name="add" size={16} color="#fff" />
              <Text style={stylesPortfolio.addBtnText}>Create a portfolio</Text>
            </TouchableOpacity>
          </View>
        ) : noResults ? (
          // No search results
          <View style={stylesPortfolio.emptyState}>
            <Icon name="briefcase-outline" size={32} color="#d1d5db" />
            <Text style={stylesPortfolio.noResults}>No portfolios match "{debouncedSearch}"</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={portfolios}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <PortfolioCard portfolio={item} onDelete={handleDelete} color={PORTFOLIO_COLORS[index % PORTFOLIO_COLORS.length]}/>
              )}
              contentContainerStyle={stylesPortfolio.list}
            />

            {/* Pagination */}
            <View style={stylesPortfolio.pagination}>
              <TouchableOpacity
                disabled={page === 1}
                onPress={() => setPage((p) => p - 1)}
                style={[stylesPortfolio.pageBtn, page === 1 && stylesPortfolio.pageBtnDisabled]}
              >
                <Icon name="chevron-back" size={18} color={page === 1 ? "#d1d5db" : "#7c3aed"} />
              </TouchableOpacity>
              <Text style={stylesPortfolio.pageText}>{page} / {totalPages}</Text>
              <TouchableOpacity
                disabled={page === totalPages}
                onPress={() => setPage((p) => p + 1)}
                style={[stylesPortfolio.pageBtn, page === totalPages && stylesPortfolio.pageBtnDisabled]}
              >
                <Icon name="chevron-forward" size={18} color={page === totalPages ? "#d1d5db" : "#7c3aed"} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Create Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={stylesPortfolio.overlay}>
          <View style={stylesPortfolio.modal}>
            <Text style={stylesPortfolio.modalTitle}>New portfolio</Text>

            {/* Name input */}
            <TextInput
              style={stylesPortfolio.modalInput}
              placeholder="Portfolio name"
              placeholderTextColor="#9ca3af"
              value={newName}
              onChangeText={setNewName}
            />

            {/* Currency picker */}
            <Text style={stylesPortfolio.currencyLabel}>Display currency</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={stylesPortfolio.currencyScroll}
              contentContainerStyle={stylesPortfolio.currencyList}
            >
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.uuid}
                  style={[
                    stylesPortfolio.currencyChip,
                    newCurrencyId === currency.uuid && stylesPortfolio.currencyChipActive,
                  ]}
                  onPress={() => setNewCurrencyId(currency.uuid)}
                >
                  <Text style={[
                    stylesPortfolio.currencyChipText,
                    newCurrencyId === currency.uuid && stylesPortfolio.currencyChipTextActive,
                  ]}>
                    {currency.currencyName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Actions */}
            <View style={stylesPortfolio.modalActions}>
              <TouchableOpacity
                style={stylesPortfolio.cancelBtn}
                onPress={() => { setModalVisible(false); setNewName(""); setNewCurrencyId(""); }}
              >
                <Text style={stylesPortfolio.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[stylesPortfolio.createBtn, (!newName.trim() || !newCurrencyId) && stylesPortfolio.createBtnDisabled]}
                onPress={handleCreate}
                disabled={creating || !newName.trim() || !newCurrencyId}
              >
                {creating
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={stylesPortfolio.createText}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default Portfolios