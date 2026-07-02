import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import CardSectorPerf, { type SectorCardDataProps } from "../components/card/CardSectorPerf";
import AnalysisService from "../services/Analysis";
import ErrorCardInApp from "../components/card/ErrorCard";
import Loading from "../components/loading/Loading";
import SearchBar from "../components/search/SearchBar";
import { clusterName } from "../utils/ClusterNaming";
import { usePortfolio } from "../providers/PortfolioProvider";
import NoPortfolioSelected from "../components/card/NoPortfolioSelected";
import type { AssetRankingResponse } from "../responses/AssetAnalysisResponse";
import { StocksDetail } from "../components/stock_analysis/StockDetail";
import { RankingType } from "../enums/RankType";
import Icon from "react-native-vector-icons/Ionicons";

// Root stack param list — adjust to match your actual navigator's typing.
type RootStackParamList = {
  AnalysisDetail: { id: string; type: RankingType };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ViewType = "cluster" | "sector" | "my_stocks" | "countries";

const Analysis: React.FC = () => {
  const analysisService = AnalysisService.getInstance();
  const [clusters, setClusters] = useState<SectorCardDataProps[]>([]);
  const [sectors, setSectors] = useState<SectorCardDataProps[]>([]);
  const [countries, setCountries] = useState<SectorCardDataProps[]>([]);
  const [userStocks, setUserStocks] = useState<AssetRankingResponse | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [view, setView] = useState<ViewType>("my_stocks");
  const { selectedPortfolio } = usePortfolio();
  const didMountRef = React.useRef(false);

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
              ? analysisService.getUserStocksMetaData(selectedPortfolio.id)
              : Promise.resolve(null),
          ]);

        const mappingSectors = sectorsMetaData.sectorsData.map((sector) => {
          const mapped: SectorCardDataProps = {
            name: sector.sector?.sector_name ?? "",
            perf52w: sector.mean_perf,
            top: sector.best_performers.map((p) => ({
              name: p.asset.display_name ?? "",
              perf: p.perf,
            })),
            worst: sector.worst_performers.map((p) => ({
              name: p.asset.display_name ?? "",
              perf: p.perf,
            })),
            length: sector.length,
            onClick: () =>
              navigation.navigate("AnalysisDetail", {
                id: sector.sector?.uuid ?? "",
                type: RankingType.SECTORS,
              }),
          };
          return mapped;
        });
        setSectors(mappingSectors);

        const mappingClusters = clusterMetaData.sectorsData.map((cluster) => {
          const mapped: SectorCardDataProps = {
            name: clusterName(cluster.unique_key),
            perf52w: cluster.mean_perf,
            top: cluster.best_performers.map((p) => ({
              name: p.asset.display_name ?? "",
              perf: p.perf,
            })),
            worst: cluster.worst_performers.map((p) => ({
              name: p.asset.display_name ?? "",
              perf: p.perf,
            })),
            length: cluster.length,
            onClick: () => {}
              /**navigation.navigate("AnalysisDetail", {
                id: cluster.unique_key,
                type: RankingType.CLUSTERS,
              }),**/
          };
          return mapped;
        });
        setClusters(mappingClusters);

        const mappingCountries = countriesMetaData.sectorsData.map((country) => {
          const mapped: SectorCardDataProps = {
            name: country.country?.country_name ?? "",
            perf52w: country.mean_perf,
            top: country.best_performers.map((p) => ({
              name: p.asset.display_name ?? "",
              perf: p.perf,
            })),
            worst: country.worst_performers.map((p) => ({
              name: p.asset.display_name ?? "",
              perf: p.perf,
            })),
            length: country.length,
            onClick: () =>
              navigation.navigate("AnalysisDetail", {
                id: country.country?.uuid ?? "",
                type: RankingType.COUNTRIES,
              }),
          };
          return mapped;
        });
        setCountries(mappingCountries);

        setUserStocks(userStocksMetaData);
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
      return; // skip initial mount, effect #1 already handles it
    }
    if (!selectedPortfolio) return;
    setLoading(true);
    setHasError(false);
    analysisService
      .getUserStocksMetaData(selectedPortfolio.id)
      .then(setUserStocks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedPortfolio]);

  if (loading) {
    return <Loading />;
  }
  if (hasError || sectors == null || clusters == null) {
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
  }

  const filteredClusters = clusters.filter((c) =>
    c.name?.toLowerCase()?.includes(search.toLowerCase())
  );
  const filteredSectors = sectors.filter((c) =>
    c.name?.toLowerCase()?.startsWith(search.toLowerCase())
  );
  const filteredCountries = countries.filter((c) =>
    c.name?.toLowerCase()?.startsWith(search.toLowerCase())
  );
  const filteredUserStocks = (userStocks?.sectorsData ?? []).filter((p) =>
    p.asset.display_name?.toLowerCase()?.includes(search.toLowerCase())
  );

  const tabs: { key: ViewType; label: string }[] = [
    { key: "my_stocks", label: "My stocks" },
    { key: "sector", label: "Sectors" },
    { key: "countries", label: "Countries" },
    { key: "cluster", label: "Group by characteristic" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Analysis</Text>
          <Text style={styles.headerSubtitle}>
            See each assets ranking compared to peers in the past year.
          </Text>
        </View>
        <SearchBar value={search} onChange={setSearch} placeholder="Search groups…" />
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tabButton, view === tab.key && styles.tabButtonActive]}
            onPress={() => setView(tab.key)}
          >
            <Text
              style={[styles.tabButtonText, view === tab.key && styles.tabButtonTextActive]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {view === "my_stocks" &&
        (!selectedPortfolio || selectedPortfolio.id === "" ? (
          <NoPortfolioSelected />
        ) : (
          <View style={styles.stocksCard}>
            {userStocks == null || filteredUserStocks.length === 0 ? (
              <Text style={styles.emptyText}>No stocks found</Text>
            ) : (
              filteredUserStocks.map((p) => (
                <View key={p.asset.uuid}>
                  <StocksDetail rankAsset={p} mainRank="sectors" />
                </View>
              ))
            )}
          </View>
        ))}

      {view === "cluster" && (
        <View style={styles.grid}>
          {filteredClusters.length === 0 ? (
            <Text style={[styles.emptyText, styles.emptyTextFullWidth]}>No clusters found</Text>
          ) : (
            filteredClusters.map((c) => <CardSectorPerf key={c.name} {...c} />)
          )}
        </View>
      )}

      {view === "sector" && (
        <View style={styles.grid}>
          {filteredSectors.length === 0 ? (
            <Text style={[styles.emptyText, styles.emptyTextFullWidth]}>No sectors found</Text>
          ) : (
            filteredSectors.map((s) => <CardSectorPerf key={s.name} {...s} />)
          )}
        </View>
      )}

      {view === "countries" && (
        <View style={styles.grid}>
          {filteredCountries.length === 0 ? (
            <Text style={[styles.emptyText, styles.emptyTextFullWidth]}>No countries found</Text>
          ) : (
            filteredCountries.map((c) => <CardSectorPerf key={c.name} {...c} />)
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  headerRow: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },

  tabBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#F4F4F5",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "white",
    // subtle shadow to mimic shadow-sm
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: { fontSize: 13, fontWeight: "500", color: "#A1A1AA" },
  tabButtonTextActive: { color: "#18181B" },

  stocksCard: {
    marginTop: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E4E4E7",
    borderRadius: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
  },

  emptyText: {
    fontSize: 13,
    color: "#A1A1AA",
    textAlign: "center",
    paddingVertical: 24,
  },
  emptyTextFullWidth: { width: "100%" },
});

export default Analysis;
