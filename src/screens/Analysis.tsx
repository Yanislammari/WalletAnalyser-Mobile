import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";
import CardSectorPerf, { type SectorCardDataProps } from "../components/card/CardSectorPerf";
import AnalysisService from "../services/Analysis";
import ErrorCardInApp from "../components/card/ErrorCard";
import Loading from "../components/loading/Loading";
import SearchBar from "../components/search/SearchBar";
import { clusterName } from "../utils/ClusterNaming";
import { usePortfolio } from "../providers/PortfolioProvider";
import NoPortfolioSelected from "../components/card/NoPortfolioSelected";
import type { AssetRankingResponse, RankedAsset } from "../responses/AssetAnalysisResponse";
import { StocksDetail } from "../components/stock_analysis/StockDetail";
import { RankingType } from "../enums/RankType";
import Icon from "react-native-vector-icons/Ionicons";
import ViewSelector, { ViewType } from "../components/modal/SelectView";
import { AnalysisStackParamList } from "../nav/NavBar";
import { toast } from "sonner-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";

type NavigationProp = NativeStackNavigationProp<AnalysisStackParamList>;

const Analysis: React.FC = () => {
  const analysisService = AnalysisService.getInstance();
  const navigation = useNavigation<NavigationProp>();
  const [clusters, setClusters] = useState<SectorCardDataProps[]>([]);
  const [sectors, setSectors] = useState<SectorCardDataProps[]>([]);
  const [countries, setCountries] = useState<SectorCardDataProps[]>([]);
  const [userStocks, setUserStocks] = useState<AssetRankingResponse | null>(null);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [view, setView] = useState<ViewType>("my_stocks");
  const { selectedPortfolio } = usePortfolio();
  const didMountRef = useRef(false);
  const didMountSearchRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const LIMIT = 50;

  const bottomOffsetRef = useRef(0);
  const loadingRef = useRef(false);
  const [hasMoreDown, setHasMoreDown] = useState(true);
  const [isLoadingMoreDown, setIsLoadingMoreDown] = useState(false);

  const fetchMoreStocks = useCallback(
    async (currentSearch: string, replace: boolean) => {
      if (loadingRef.current) return;
      if (!replace && !hasMoreDown) return;
      if (!selectedPortfolio) return;
      loadingRef.current = true;
      setIsLoadingMoreDown(true);

      const fetchOffset = replace ? 0 : bottomOffsetRef.current;

      try {
        const newData = await analysisService.getUserStocksMetaData(
          selectedPortfolio.id, fetchOffset, LIMIT, currentSearch
        );
        setUserStocks(prev => {
          if (replace || !prev) {
            return { ...(prev ?? { sectorsData: [] }), sectorsData: newData.sectorsData };
          }
          return { ...prev, sectorsData: [...prev.sectorsData, ...newData.sectorsData] };
        });

        if (newData.sectorsData.length === 0) setHasMoreDown(false);
        else if (replace) setHasMoreDown(true);

        bottomOffsetRef.current = fetchOffset + LIMIT;
      } catch {
        toast.error("Can't fetch more stocks");
      } finally {
        loadingRef.current = false;
        setIsLoadingMoreDown(false);
      }
    },
    [hasMoreDown, selectedPortfolio]
  );

  const handleEndReached = useCallback(() => {
    if(!hasMoreDown || isLoadingMoreDown)return
    fetchMoreStocks(search, false);
  }, [fetchMoreStocks, search]);

  const handleRefresh = async () => {
    if (!selectedPortfolio) return;
    setRefreshing(true);
    try {
      bottomOffsetRef.current = 0;
      setHasMoreDown(true);
      const userStocksMetaData = await analysisService.getUserStocksMetaData(selectedPortfolio.id, 0, LIMIT, search);
      setUserStocks(userStocksMetaData);
      bottomOffsetRef.current = LIMIT;
    } catch {
      toast.error("Can't reload the page.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [sectorsMetaData, clusterMetaData, countriesMetaData, userStocksMetaData] =
          await Promise.all([
            analysisService.getSectorsMetaData(),
            analysisService.getClustersMetaData(),
            analysisService.getCountriesMetaData(),
            selectedPortfolio
              ? analysisService.getUserStocksMetaData(selectedPortfolio.id, 0, LIMIT, "")
              : Promise.resolve(null),
          ]);

        const mappingSectors = sectorsMetaData.sectorsData.map((sector) => ({
          name: sector.sector?.sector_name ?? "",
          perf52w: sector.mean_perf,
          top: sector.best_performers.map((p) => ({ name: p.asset.display_name ?? "", perf: p.perf })),
          worst: sector.worst_performers.map((p) => ({ name: p.asset.display_name ?? "", perf: p.perf })),
          length: sector.length,
          onClick: () => navigation.navigate("AnalysisDetail", { id: sector.sector?.uuid ?? "", type: RankingType.SECTORS, offset: 0 }),
        }));
        setSectors(mappingSectors);

        const mappingClusters = clusterMetaData.sectorsData.map((cluster) => ({
          name: clusterName(cluster.unique_key),
          perf52w: cluster.mean_perf,
          top: cluster.best_performers.map((p) => ({ name: p.asset.display_name ?? "", perf: p.perf })),
          worst: cluster.worst_performers.map((p) => ({ name: p.asset.display_name ?? "", perf: p.perf })),
          length: cluster.length,
          onClick: () => navigation.navigate("AnalysisDetail", { id: cluster.unique_key?.toString(), type: RankingType.CLUSTERS, offset: 0 }),
        }));
        setClusters(mappingClusters);

        const mappingCountries = countriesMetaData.sectorsData.map((country) => ({
          name: country.country?.country_name ?? "",
          perf52w: country.mean_perf,
          top: country.best_performers.map((p) => ({ name: p.asset.display_name ?? "", perf: p.perf })),
          worst: country.worst_performers.map((p) => ({ name: p.asset.display_name ?? "", perf: p.perf })),
          length: country.length,
          onClick: () => navigation.navigate("AnalysisDetail", { id: country.country?.uuid ?? "", type: RankingType.COUNTRIES, offset: 0 }),
        }));
        setCountries(mappingCountries);

        setUserStocks(userStocksMetaData);
        bottomOffsetRef.current = LIMIT;
        setHasMoreDown(true);
      } catch (error: any) {
        console.log(error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (!selectedPortfolio) return;
    setLoading(true);
    setHasError(false);
    bottomOffsetRef.current = 0;
    setHasMoreDown(true);
    analysisService
      .getUserStocksMetaData(selectedPortfolio.id, 0, LIMIT, "")
      .then((data) => {
        setUserStocks(data);
        bottomOffsetRef.current = LIMIT;
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedPortfolio]);

  useEffect(() => {
    if (!didMountSearchRef.current) {
      didMountSearchRef.current = true;
      return;
    }
    if (view !== "my_stocks" || !selectedPortfolio) return;

    const timeout = setTimeout(() => {
      bottomOffsetRef.current = 0;
      setHasMoreDown(true);
      fetchMoreStocks(search, true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  
  const filteredClusters = clusters.filter((c) => c.name?.toLowerCase()?.includes(search.toLowerCase()));
  const filteredSectors = sectors.filter((c) => c.name?.toLowerCase()?.startsWith(search.toLowerCase()));
  const filteredCountries = countries.filter((c) => c.name?.toLowerCase()?.startsWith(search.toLowerCase()));

  const keyExtractor = useCallback((p: RankedAsset) => p.asset.uuid, []);
  const renderStockItem = useCallback(
    ({ item }: { item: RankedAsset }) => (
      <StocksDetail rankAsset={item} mainRank="sectors" blockClick={false} highlightAnim={null} />
    ),
    []
  );

  if (loading) {
    return <Loading />;
  }
  if (hasError || sectors == null || clusters == null) {
    if (hasError) {
      return (
        <ErrorCardInApp
          iconBg="#F3F4F6"
          icon={<Icon name="close-circle-outline" size={32} color="#9CA3AF" />}
          title="Can't fetch analysis details"
          description="An error has occured try again later"
        />
      );
    }
  }

  const renderHeader = () => (
    <>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Analysis</Text>
          <Text style={styles.headerSubtitle}>See each assets ranking compared to peers in the past year.</Text>
        </View>
        <SearchBar value={search} onChange={setSearch} placeholder="Search groups…" />
      </View>
      <ViewSelector view={view} setView={setView} />
    </>
  );

  // Vue "my_stocks" : FlashList seul, pas dans un ScrollView
  if (view === "my_stocks") {
    if (!selectedPortfolio || selectedPortfolio.id === "") {
      return (
        <View style={styles.container}>
          {renderHeader()}
          <NoPortfolioSelected />
        </View>
      );
    }
    return (
      <View style={[styles.flashlistContainer, styles.flex1]}>
        {renderHeader()}
        {userStocks == null || userStocks.sectorsData == null || userStocks.sectorsData.length === 0 ? (
          <Text style={styles.emptyText}>No stocks found</Text>
        ) : (
          <FlashList
            style={styles.stocksCard}
            data={userStocks.sectorsData}
            keyExtractor={keyExtractor}
            renderItem={renderStockItem}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            ListFooterComponent={isLoadingMoreDown ? <Loading /> : null}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      {view === "cluster" && (
        <FlatList
          data={filteredClusters}
          keyExtractor={(c) => c.name ?? ""}
          renderItem={({ item }) => (
            <View style={styles.gridItemWrapper}>
              <CardSectorPerf {...item} />
            </View>
          )}
          initialNumToRender={8} 
          windowSize={7}
          removeClippedSubviews={true}
          ListEmptyComponent={<Text style={[styles.emptyText, styles.emptyTextFullWidth]}>No clusters found</Text>}
        />
      )}

      {view === "sector" && (
        <FlatList
          data={filteredSectors}
          keyExtractor={(s) => s.name ?? ""}
          renderItem={({ item }) => (
            <View style={styles.gridItemWrapper}>
              <CardSectorPerf {...item} />
            </View>
          )}
          initialNumToRender={8}
          windowSize={7}
          removeClippedSubviews={true}
          ListEmptyComponent={<Text style={[styles.emptyText, styles.emptyTextFullWidth]}>No sectors found</Text>}
        />
      )}

      {view === "countries" && (
        <FlatList
          data={filteredCountries}
          keyExtractor={(c) => c.name ?? ""}
          renderItem={({ item }) => (
            <View style={styles.gridItemWrapper}>
              <CardSectorPerf {...item} />
            </View>
          )}
          initialNumToRender={8} 
          windowSize={7}
          removeClippedSubviews={true}
          ListEmptyComponent={<Text style={[styles.emptyText, styles.emptyTextFullWidth]}>No countries found</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, marginBottom : 175 },
  flashlistContainer: { padding: 16, paddingBottom: 15},
  flex1: { flex: 1 },
  headerRow: { flexDirection: "column", gap: 12, marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  stocksCard: {
    marginTop: 8,
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E4E4E7",
    borderRadius: 12,
  },
  grid: { flexDirection: "column", gap: 12 },
  emptyText: { fontSize: 13, color: "#A1A1AA", textAlign: "center", paddingVertical: 24 },
  emptyTextFullWidth: { width: "100%" },
  gridItemWrapper: {
    flex: 1,
    paddingBottom : 6,
  },
});

export default Analysis;