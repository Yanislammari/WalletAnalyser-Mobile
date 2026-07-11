import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRoute, RouteProp } from "@react-navigation/native";

import AnalysisService from "../services/Analysis";
import SearchBar from "../components/search/SearchBar";
import Loading from "../components/loading/Loading";
import ErrorCardInApp from "../components/card/ErrorCard";
import type { AssetRankingResponse, RankedAsset } from "../responses/AssetAnalysisResponse";
import { RankingType } from "../enums/RankType";
import { getMainRankPosition, StocksDetail } from "../components/stock_analysis/StockDetail";
import { AnalysisStackParamList } from "../nav/NavBar";
import BackButton from "../components/button/BackButton";
import { clusterName } from "../utils/ClusterNaming";
import { FlashList, FlashListRef } from "@shopify/flash-list";

type AnalysisDetailRouteProp = RouteProp<AnalysisStackParamList, "AnalysisDetail">;

const FIXED_ROW_HEIGHT = 96;

const AnalysisDetail: React.FC = () => {
  const route = useRoute<AnalysisDetailRouteProp>();
  const analysisService = AnalysisService.getInstance();

  const uuid = route.params?.id;
  const type: RankingType = (route.params?.type as RankingType) ?? RankingType.SECTORS;
  const rawOffset = route.params?.offset ?? 0;
  const safeOffset = isNaN(Number(rawOffset)) ? 0 : Number(rawOffset);

  const [search, setSearch] = useState<string>("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [sectorMetaData, setSectorMetaData] = useState<AssetRankingResponse | null>(null);
  const [title, setTitle] = useState("Peers vs peers");

  const flatListRef = useRef<FlashListRef<RankedAsset>>(null);
  const isFirstFetch = useRef(true);

  useEffect(() => {
    let isCurrent = true;
    if (!isFirstFetch.current) setInitialLoading(true);
    setSectorMetaData(null);
    setHasError(false);

    const fetchData = async () => {
      try {
        if (!uuid) throw new Error("Missing UUID");

        if (type === RankingType.SECTORS) {
          analysisService.getSectorName(uuid).then((p) => isCurrent && setTitle(p.sectorName)).catch(() => {});
        } else if (type === RankingType.COUNTRIES) {
          analysisService.getCountryName(uuid).then((p) => isCurrent && setTitle(p.countryName)).catch(() => {});
        } else if (type === RankingType.CLUSTERS) {
          setTitle(clusterName(Number(uuid)));
        }
        const t0 = Date.now();
        const response = await analysisService.getWholeSectorsDetailMetaData(type, uuid);
        console.log(`API call took: ${Date.now() - t0}ms, items: ${response?.sectorsData?.length}`);

        if (isCurrent) setSectorMetaData(response);
      } catch (e) {
        if (isCurrent) setHasError(true);
      } finally {
        if (isCurrent) {
          setInitialLoading(false);
          setRefetching(false);
          isFirstFetch.current = false;
        }
      }
    };
    fetchData();
    return () => {
      isCurrent = false;
    };
  }, [uuid, type]);

  const filtered = useMemo(() => {
    if (!sectorMetaData?.sectorsData) return [];
    const q = search.toLowerCase();
    return sectorMetaData.sectorsData.filter((p) =>
      p.asset.display_name?.toLowerCase()?.includes(q)
    );
  }, [sectorMetaData, search]);

  const highlightIndex = useMemo(() => {
    if (safeOffset <= 0) return -1;
    return filtered.findIndex((p) => getMainRankPosition(p, type).value === safeOffset);
  }, [filtered, type, safeOffset]);

  useEffect(() => {
    if (highlightIndex < 0 || initialLoading || refetching || !sectorMetaData) return;

    const timer = setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: highlightIndex,
        animated: false,
        viewPosition: 0.5,
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [highlightIndex, initialLoading, refetching, sectorMetaData]);

  // Static structure avoids computing sizes on the fly
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: FIXED_ROW_HEIGHT,
      offset: FIXED_ROW_HEIGHT * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback((p: RankedAsset) => p.asset.uuid, []);

  const renderItem = useCallback(
    ({ item, index }: { item: RankedAsset; index: number }) => {
      const isTarget = index === highlightIndex;

      return (
        <View style={[styles.rowContainer, isTarget && styles.targetRow]}>
          <StocksDetail
            rankAsset={item}
            mainRank={type}
            blockClick={true}
            highlightAnim={null}
          />
        </View>
      );
    },
    [type, highlightIndex]
  );

  if (initialLoading || refetching || !sectorMetaData) {
    return <Loading />;
  }

  if (hasError || !sectorMetaData.sectorsData) {
    return (
      <ErrorCardInApp
        iconBg="#f3f4f6"
        icon={<Icon name="close-circle-outline" size={32} color="#9ca3af" />}
        title="Can't fetch details of this sector"
        description="An error has occurred try again later"
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton />
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>- each companies</Text>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search stocks…" />
        </View>
      </View>

      <View style={styles.listWrapper}>
        {!refetching && filtered.length === 0 ? (
          <Text style={styles.emptyText}>No stocks found</Text>
        ) : (
          <FlashList
            ref={flatListRef}
            style={styles.list}
            data={filtered}
            keyExtractor={keyExtractor}
            scrollEnabled={!refetching}
            renderItem={renderItem}
            removeClippedSubviews={true} // Crucial performance feature for flat lists
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "column", gap: 12, paddingHorizontal: 16, paddingTop: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { color: "#111827", fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  subtitle: { color: "#6b7280", fontSize: 14, marginTop: 2 },
  searchContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  listWrapper: { flex: 1, marginTop: 24, marginHorizontal: 16 },
  list: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e4e4e7", borderRadius: 12, overflow: "hidden" },
  emptyText: { fontSize: 14, color: "#a1a1aa", textAlign: "center", paddingVertical: 24 },
  rowContainer: {
    height: FIXED_ROW_HEIGHT, // Enforce row height layout consistency
    justifyContent: "center",
  },
  targetRow: {
    zIndex: 99,
    backgroundColor: "#eff6ff",
    borderWidth: 2,
    borderColor: "#2563eb",
    borderRadius: 12,
  },
});

export default AnalysisDetail;
