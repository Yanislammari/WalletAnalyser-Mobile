import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  RefreshControl,
} from "react-native";
import { CompositeNavigationProp, useNavigation } from "@react-navigation/native";
import { useAuth } from "../providers/AuthProvider";
import { usePortfolio } from "../providers/PortfolioProvider";
import PortfolioService from "../services/PortfolioService";

import DmStatCard from "../components/dashboard/DmStatCard";
import DmLineChart from "../components/dashboard/DmLineChart";
import SectorBreakdown from "../components/dashboard/SectorBreakdown";
import MetricStrip from "../components/dashboard/MetricStrip";
import type { DmStatUI } from "../models/UI/DmStatUI";
import type { MetricResponse } from "../responses/MetricResponse";
import type { PortfolioTotalResponse } from "../responses/PortfolioTotalResponse";
import { fmt, fmtPct } from "../utils/helper";
import NoPortfolioSelected from "../components/card/NoPortfolioSelected";
import { C } from "../utils/color";
import { NavBarParamList, PortfolioStackParamList } from "../nav/NavBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton: React.FC<{ style?: any }> = ({ style }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.skeleton, style, { opacity }]} />;
};

// ─── Main ─────────────────────────────────────────────────────────────────────
type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<NavBarParamList, "Dashboard">,
  NativeStackNavigationProp<PortfolioStackParamList>
>;
const DashboardPage: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const portfolioService = PortfolioService.getInstance();
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [metrics, setMetrics] = useState<MetricResponse | null>(null);
  const [total, setTotal] = useState<PortfolioTotalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!selectedPortfolio) return;
    setRefreshing(true);
    try {
      const [m, t] = await Promise.all([
        portfolioService.getMetrics(selectedPortfolio.id),
        portfolioService.getPortfolioTotal(selectedPortfolio.id).catch(() => null),
      ]);
      setMetrics(m);
      setTotal(t);
    } catch {
      // ignore — keep showing whatever was already on screen
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!selectedPortfolio) {
      setMetrics(null);
      setTotal(null);
      return;
    }
    setLoading(true);
    Promise.all([
      portfolioService.getMetrics(selectedPortfolio.id),
      portfolioService.getPortfolioTotal(selectedPortfolio.id).catch(() => null),
    ])
      .then(([m, t]) => {
        setMetrics(m);
        setTotal(t);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, [selectedPortfolio, refreshing]);

  // ─── Stat cards ────────────────────────────────────────────────────────────

  const cy = metrics?.currencyName ?? total?.currencyName ?? "EUR";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const dashStats: DmStatUI[] = metrics
    ? [
        {
          label: "Portfolio value",
          value: total ? fmt(total.totalValue, cy) : "—",
          delta: `${fmtPct(metrics.gainPercent)} all time`,
          up: metrics.gain >= 0,
        },
        {
          label: "Net gain",
          value: fmt(metrics.gain, cy),
          delta: `${fmtPct(metrics.gainPercent)} on invested`,
          up: metrics.gain >= 0,
        },
        {
          label: "Sharpe ratio",
          value: metrics.sharpeRatio.toFixed(2),
          delta: `CAGR ${fmtPct(metrics.cagr)} / yr`,
          up: metrics.sharpeRatio >= 1,
        },
        {
          label: "Volatility",
          value: `${metrics.volatility.toFixed(1)}%`,
          delta: "annualized",
          up: false,
          neutral: true,
        },
      ]
    : [];

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>
              {greeting}
              {user?.firstName ? `, ${user.firstName}` : ""}
            </Text>
            <Text style={styles.subtitle}>Here's what's happening with your portfolio today.</Text>
          </View>
        </View>

        {/* No portfolio */}
        {!selectedPortfolio && (
          <NoPortfolioSelected />
        )}

        {/* Stat cards */}
        {selectedPortfolio &&
          (loading ? (
            <View style={styles.statGrid}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} style={styles.statSkeleton} />
              ))}
            </View>
          ) : (
            <View style={styles.statGrid}>
              {dashStats.map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <DmStatCard stat={stat} />
                </View>
              ))}
            </View>
          ))}

        {/* Chart + allocation */}
        {selectedPortfolio &&
          (loading ? (
            <View style={{ gap: 16 }}>
              <Skeleton style={styles.chartSkeleton} />
              <Skeleton style={styles.chartSkeleton} />
            </View>
          ) : (
            metrics && (
              <View style={{ gap: 16 }}>
                <View style={styles.panelCard}>
                  <DmLineChart data={metrics.monthlyData} currency={cy} />
                </View>
                <View style={styles.panelCard}>
                  <SectorBreakdown holdings={metrics.topHoldings} />
                </View>
              </View>
            )
          ))}

        {/* Metric strip */}
        {selectedPortfolio &&
          (loading ? (
            <Skeleton style={styles.stripSkeleton} />
          ) : (
            metrics &&
            metrics.totalInvested > 0 && (
              <View style={styles.panelCard}>
                <Text style={styles.stripLabel}>Performance metrics</Text>
                <MetricStrip metrics={metrics} />
              </View>
            )
          ))}

        {/* Empty state — no transactions */}
        {!loading && metrics && metrics.totalInvested === 0 && (
          <View style={styles.noTxnBox}>
            <Text style={styles.noTxnTitle}>No transactions yet</Text>
            <Text style={styles.noTxnSubtitle}>Add your first buy to start tracking your portfolio.</Text>
            <TouchableOpacity
              style={styles.noTxnButton}
              onPress={() =>
                selectedPortfolio &&
                navigation.navigate("Portfolio", {
                  screen: "PortfolioDetail",
                  params: { id: selectedPortfolio.id, name: selectedPortfolio.name },
                })
              }
            >
              <Text style={styles.noTxnButtonText}>Go to Transactions</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  screenContent: { padding: 16, gap: 20, paddingBottom: 40 },

  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  title: { color: C.gray900, fontSize: 20, fontWeight: "700" },
  subtitle: { color: C.gray500, fontSize: 13, marginTop: 2 },

  addTxnBtn: {
    backgroundColor: C.purple600,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: C.purple600,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  addTxnBtnText: { color: C.white, fontSize: 13, fontWeight: "600" },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 72, gap: 16 },
  emptyIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: C.purple50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { color: C.gray800, fontWeight: "600", fontSize: 16 },
  emptySubtitle: { color: C.gray400, fontSize: 13, marginTop: 4, textAlign: "center", maxWidth: 260 },
  primaryButton: { marginTop: 4, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: C.purple600, borderRadius: 12 },
  primaryButtonText: { color: C.white, fontSize: 14, fontWeight: "500" },

  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: "47%",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray100,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  statSkeleton: { width: "47%", height: 96 },

  panelCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray100,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  chartSkeleton: { height: 208 },
  stripSkeleton: { height: 80 },
  stripLabel: { color: C.gray400, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontWeight: "500", marginBottom: 8 },

  noTxnBox: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray100,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  noTxnTitle: { color: C.gray600, fontWeight: "600", fontSize: 15 },
  noTxnSubtitle: { color: C.gray400, fontSize: 13, marginTop: 4, textAlign: "center" },
  noTxnButton: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.purple600, borderRadius: 12 },
  noTxnButtonText: { color: C.white, fontSize: 13, fontWeight: "600" },

  skeleton: { backgroundColor: C.gray100, borderRadius: 12 },
});

export default DashboardPage;
