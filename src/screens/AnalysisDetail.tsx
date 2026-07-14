import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
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
  const [hasError, setHasError] = useState(false);
  const [sectorMetaData, setSectorMetaData] = useState<AssetRankingResponse | null>(null);
  const [title, setTitle] = useState("Peers vs peers");

  const flatListRef = useRef<FlashListRef<RankedAsset>>(null);
  const hasScrolledOnceRef = useRef(false);
  const isFirstFetch = useRef(true);
  const isAutoScrollingRef = useRef(safeOffset > 0);
  const didMountSearchRef = useRef(false);

  const LIMIT = 50;
  const offsetStarter = 25;
  const topOffsetRef = useRef(safeOffset - offsetStarter);
  const bottomOffsetRef = useRef(safeOffset + offsetStarter)
  const loadingRef = useRef(false);
  const [hasMoreUp, setHasMoreUp] = useState(true);
  const [hasMoreDown, setHasMoreDown] = useState(true);
  const [isLoadingMoreUp, setIsLoadingMoreUp] = useState(false);
  const [isLoadingMoreDown, setIsLoadingMoreDown] = useState(false);

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
        const response = await analysisService.getWholeSectorsDetailMetaData(type, uuid, safeOffset - offsetStarter < 0 ? 0 : safeOffset - offsetStarter, LIMIT, "");
        if (isCurrent) setSectorMetaData(response);
      } catch (e) {
        if (isCurrent) setHasError(true);
      } finally {
        if (isCurrent) {
          setInitialLoading(false);
          isFirstFetch.current = false;
        }
      }
    };
    fetchData();
    return () => {
      isCurrent = false;
    };
  }, [uuid, type]);

  const highlightIndex = useMemo(() => {
    if (safeOffset <= 0) return -1;
    return sectorMetaData?.sectorsData.findIndex((p) => getMainRankPosition(p, type).value === safeOffset);
  }, [type, safeOffset]);

  useEffect(() => {
    if(hasScrolledOnceRef.current)return
    if (highlightIndex == undefined)return
    if (highlightIndex < 0 || initialLoading || !sectorMetaData) return;

    hasScrolledOnceRef.current = true
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: highlightIndex,
        animated: false,
        viewPosition: 0.5,
      });
    }, 250);
    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 300);
    return () => clearTimeout(timer);
  }, [highlightIndex, initialLoading, sectorMetaData]);

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

  const fetchMore = useCallback(
    async (isBottom: boolean) => {
      if (loadingRef.current) return;
      if (isBottom && !hasMoreDown) return;
      if (!isBottom && !hasMoreUp) return;
      loadingRef.current = true;
      isBottom ? setIsLoadingMoreDown(true) : setIsLoadingMoreUp(true);

      let fetchOffset: number;
      let fetchLimit = LIMIT;

      if (isBottom) {
        fetchOffset = bottomOffsetRef.current;
      } else {
        const currentTop = topOffsetRef.current;
        if (currentTop <= 0) {
          setHasMoreUp(false);
          loadingRef.current = false;
          setIsLoadingMoreUp(false);
          return;
        }
        fetchOffset = Math.max(0, currentTop - LIMIT);
        fetchLimit = currentTop - fetchOffset;
      }

      try {
        if (!uuid) return;
        const newData = await analysisService.getWholeSectorsDetailMetaData(type, uuid, fetchOffset, fetchLimit, search);

        setSectorMetaData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            sectorsData: isBottom
              ? [...prev.sectorsData, ...newData.sectorsData]
              : [...newData.sectorsData, ...prev.sectorsData]
          };
        });

        if (isBottom) {
          if (newData.sectorsData.length === 0) setHasMoreDown(false);
          bottomOffsetRef.current += LIMIT;
        } else {
          topOffsetRef.current = fetchOffset;
          if (fetchOffset <= 0 || newData.sectorsData.length === 0) setHasMoreUp(false);
        }
      } catch {
        // toast erreur ici si besoin
      } finally {
        loadingRef.current = false;
        setIsLoadingMoreUp(false);
        setIsLoadingMoreDown(false);
      }
    },
    [hasMoreDown, hasMoreUp, uuid, type, search]
  );

  const handleEndReached = useCallback(() => {
    fetchMore(true);
  }, [fetchMore]);

  const handleStartReached = useCallback(() => {
    if (isAutoScrollingRef.current) return;
    fetchMore(false);
  }, [fetchMore]);

  useEffect(() => {
    if (!didMountSearchRef.current) {
      didMountSearchRef.current = true;
      return; // skip le premier run, le fetch initial est déjà fait dans fetchData
    }

    const timeout = setTimeout(async () => {
      setHasMoreDown(true);
      setHasMoreUp(false);
      bottomOffsetRef.current = 0;
      topOffsetRef.current = 0;
      loadingRef.current = true;
      setIsLoadingMoreDown(true);

      try {
        if (!uuid) return;
        const newData = await analysisService.getWholeSectorsDetailMetaData(type, uuid, 0, LIMIT, search);
        setSectorMetaData(prev => (prev ? { ...prev, sectorsData: newData.sectorsData } : prev));
        if (newData.sectorsData.length === 0) setHasMoreDown(false);
        bottomOffsetRef.current = LIMIT;
      } catch {
        // gérer l'erreur si besoin
      } finally {
        loadingRef.current = false;
        setIsLoadingMoreDown(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, uuid, type]);

  if (initialLoading || !sectorMetaData) {
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
        {sectorMetaData.sectorsData.length === 0 ? (
          <Text style={styles.emptyText}>No stocks found</Text>
        ) : (
          <FlashList
            ref={flatListRef}
            style={styles.list}
            data={sectorMetaData.sectorsData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            removeClippedSubviews={true}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            onStartReached={handleStartReached}
            onStartReachedThreshold={1.5}
            maintainVisibleContentPosition={{
              autoscrollToTopThreshold: 0.1,
              startRenderingFromBottom: false,
            }}
            ListFooterComponent={isLoadingMoreDown ? <Loading /> : null}
            ListHeaderComponent={isLoadingMoreUp ? <Loading /> : null}
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
