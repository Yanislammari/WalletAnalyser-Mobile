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
import AllocationBreakdown from "../components/dashboard/AllocationBreakdown"; // <-- Ajout de l'import
import type { DmStatUI } from "../models/UI/DmStatUI";
import type { MetricResponse } from "../responses/MetricResponse";
import type { PortfolioTotalResponse } from "../responses/PortfolioTotalResponse";
import { fmt, fmtPct } from "../utils/helper";
import NoPortfolioSelected from "../components/card/NoPortfolioSelected";
import { C } from "../utils/color";
import { NavBarParamList, PortfolioStackParamList } from "../nav/NavBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import ErrorCardInApp from "../components/card/ErrorCard";
import Icon from "react-native-vector-icons/Ionicons";
import MetricStrip from "../components/dashboard/MetricStrip";
import { DashboardDataResponse } from "../responses/DashboardDataResponse";

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
  const { user } = useAuth(); // NOTE : Récupère l'information "isPro" ou équivalent ici si disponible
  const { selectedPortfolio } = usePortfolio();
  const [metrics, setMetrics] = useState<MetricResponse | null>(null);
  const [total, setTotal] = useState<PortfolioTotalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardDataResponse | null>(null);
  const { isPro } = useAuth();

  const handleRefresh = async () => {
    if (!selectedPortfolio) return;
    setRefreshing(true);
    setError(null);

    const portfolioId = selectedPortfolio.id;

    // Préparation des requêtes
    const fetchTotal = portfolioService.getPortfolioTotal(portfolioId).catch(() => null);
    const fetchDashboard = portfolioService.getDashboardData(portfolioId).catch(() => null);
    
    // On ne récupère les metrics que si l'utilisateur est Pro pour éviter l'erreur 403
    const fetchMetrics = isPro
      ? portfolioService.getMetrics(portfolioId).catch(() => null)
      : Promise.resolve(null);

    try {
      const [m, t, d] = await Promise.all([fetchMetrics, fetchTotal, fetchDashboard]);
      setMetrics(m);
      setTotal(t);
      setDashboardData(d);
    } catch (e: any) {
      setError("Failed to refresh portfolio data. Please try again later.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadMetrics = async () => {
      if (!selectedPortfolio) {
        setMetrics(null);
        setTotal(null);
        setDashboardData(null);
        return;
      }

      setLoading(true);
      setError(null);

      const portfolioId = selectedPortfolio.id;

      const fetchTotal = portfolioService.getPortfolioTotal(portfolioId).catch(() => null);
      const fetchDashboard = portfolioService.getDashboardData(portfolioId).catch(() => null);
      
      const fetchMetrics = isPro
        ? portfolioService.getMetrics(portfolioId).catch(() => null)
        : Promise.resolve(null);

      try {
        const [m, t, d] = await Promise.all([fetchMetrics, fetchTotal, fetchDashboard]);
        setMetrics(m);
        setTotal(t);
        setDashboardData(d);
      } catch (e: any) {
        setError("Failed to load portfolio data. Please try again later.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    loadMetrics();
  }, [selectedPortfolio, isPro]);

  // ─── Stat cards ────────────────────────────────────────────────────────────

  const cy = metrics?.currencyName ?? dashboardData?.currencyName ?? total?.currencyName ?? "EUR";
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
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
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
        {!selectedPortfolio && <NoPortfolioSelected />}

        {error && (
          <ErrorCardInApp
            iconBg="#f3f4f6"
            icon={<Icon name="close-circle-outline" size={32} color="#9ca3af" />}
            title=""
            description={error}
          />
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

        {/* Chart + holdings */}
        {selectedPortfolio &&
          (loading ? (
            <View style={{ gap: 16 }}>
              <Skeleton style={styles.chartSkeleton} />
              <Skeleton style={styles.chartSkeleton} />
            </View>
          ) : dashboardData && (
              <View style={{ gap: 16 }}>
                <View style={styles.panelCard}>
                  <DmLineChart data={dashboardData.monthlyData} currency={cy} />
                </View>
                <View style={styles.panelCard}>
                  <SectorBreakdown holdings={dashboardData.topHoldings} />
                </View>
              </View>
          ))}

        {/* Sector + country breakdown */}
        {selectedPortfolio && (
          loading ? (
            <View style={{ gap: 16 }}>
              <Skeleton style={styles.breakdownSkeleton} />
              <Skeleton style={styles.breakdownSkeleton} />
            </View>
          ) : (
            dashboardData && (dashboardData.sectorBreakdown.length > 0 || dashboardData.countryBreakdown.length > 0) && (
              <View style={{ gap: 16 }}>
                  <View style={styles.panelCard}>
                    <AllocationBreakdown
                      title="Sector exposure"
                      items={dashboardData.sectorBreakdown}
                      currency={cy}
                    />
                  </View>
                  <View style={styles.panelCard}>
                    <AllocationBreakdown
                      title="Geographic exposure"
                      items={dashboardData.countryBreakdown}
                      currency={cy}
                    />
                  </View>
              </View>
            )
          ))}

        {/* Metric strip — Pro only */}
        {selectedPortfolio &&
          (isPro ? (
            loading ? (
              <Skeleton style={styles.stripSkeleton} />
            ) : (
              metrics &&
              metrics.totalInvested > 0 && (
                <View style={styles.panelCard}>
                  <Text style={styles.stripLabel}>Performance metrics</Text>
                  {<MetricStrip metrics={metrics} />}
                </View>
              )
            )
          ) : (
            <View style={[styles.panelCard, styles.proLockContainer]}>
              <View style={styles.proLockLeft}>
                <View style={styles.proIconBadge}>
                  <Icon name="lock-closed-outline" size={16} color={C.purple600} />
                </View>
                <View style={styles.proTextContainer}>
                  <Text style={styles.stripLabel}>Performance metrics</Text>
                  <Text style={styles.proSubtitle}>
                    CAGR, TWR, XIRR, Sharpe ratio, max drawdown and more — Pro only
                  </Text>
                </View>
              </View>
            </View>
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
  breakdownSkeleton: { height: 200 },
  stripSkeleton: { height: 80 },
  stripLabel: { color: C.gray400, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontWeight: "500", marginBottom: 2 },

  // Styles Pro / Lock Section
  proLockContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  proLockLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  proIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.purple50,
    alignItems: "center",
    justifyContent: "center",
  },
  proTextContainer: {
    flex: 1,
  },
  proSubtitle: {
    color: C.gray500,
    fontSize: 11,
    marginTop: 2,
  },
  proUpgradeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: C.purple600,
    borderRadius: 12,
  },
  proUpgradeButtonText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "600",
  },

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