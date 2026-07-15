import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
import AllocationBreakdown from "../components/dashboard/AllocationBreakdown";
import type { DmStatUI } from "../models/UI/DmStatUI";
import type { MetricResponse } from "../responses/MetricResponse";
import type { PortfolioTotalResponse } from "../responses/PortfolioTotalResponse";
import { fmt, fmtPct, formatPeriod } from "../utils/helper";
import NoPortfolioSelected from "../components/card/NoPortfolioSelected";
import { C } from "../utils/color";
import { NavBarParamList, PortfolioStackParamList } from "../nav/NavBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import ErrorCardInApp from "../components/card/ErrorCard";
import Icon from "react-native-vector-icons/Ionicons";
import MetricStrip from "../components/dashboard/MetricStrip";
import { DashboardDataResponse } from "../responses/DashboardDataResponse";
import { dashboardStyles } from '../styles/Dashboard_style';

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

  return <Animated.View style={[dashboardStyles.skeleton, style, { opacity }]} />;
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
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardDataResponse | null>(null);
  const { isPro } = useAuth();

  const handleRefresh = async () => {
    if (!selectedPortfolio) return;
    setRefreshing(true);
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
          value: fmt(metrics.portfolioMarketValue, cy, 0),
          delta: `${fmtPct(metrics.gainPercent)} all time`,
          up: metrics.gain >= 0,
        },
        {
          label: "Net gain",
          value: fmt(metrics.gainMtm, cy, 0),
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
        style={dashboardStyles.screen}
        contentContainerStyle={dashboardStyles.screenContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={dashboardStyles.headerRow}>
          <View>
            <Text style={dashboardStyles.title}>
              {greeting}
              {user?.firstName ? `, ${user.firstName}` : ""}
            </Text>
            <Text style={dashboardStyles.subtitle}>Here's what's happening with your portfolio today.</Text>
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
            <View style={dashboardStyles.statGrid}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} style={dashboardStyles.statSkeleton} />
              ))}
            </View>
          ) : (
            <View style={dashboardStyles.statGrid}>
              {dashStats.map((stat) => (
                <View key={stat.label} style={dashboardStyles.statCard}>
                  <DmStatCard stat={stat} />
                </View>
              ))}
            </View>
          ))}

        {/* Chart + holdings */}
        {selectedPortfolio &&
          (loading ? (
            <View style={{ gap: 16 }}>
              <Skeleton style={dashboardStyles.chartSkeleton} />
              <Skeleton style={dashboardStyles.chartSkeleton} />
            </View>
          ) : dashboardData && (
              <View style={{ gap: 16 }}>
                <View style={dashboardStyles.panelCard}>
                  <DmLineChart data={dashboardData.monthlyData} currency={cy} />
                </View>
                <View style={dashboardStyles.panelCard}>
                  <SectorBreakdown holdings={dashboardData.topHoldings} />
                </View>
              </View>
          ))}

        {/* Sector + country breakdown */}
        {selectedPortfolio && (
          loading ? (
            <View style={{ gap: 16 }}>
              <Skeleton style={dashboardStyles.breakdownSkeleton} />
              <Skeleton style={dashboardStyles.breakdownSkeleton} />
            </View>
          ) : (
            dashboardData && (dashboardData.sectorBreakdown.length > 0 || dashboardData.countryBreakdown.length > 0) && (
              <View style={{ gap: 16 }}>
                  <View style={dashboardStyles.panelCard}>
                    <AllocationBreakdown
                      title="Sector exposure"
                      items={dashboardData.sectorBreakdown}
                      currency={cy}
                    />
                  </View>
                  <View style={dashboardStyles.panelCard}>
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
              <Skeleton style={dashboardStyles.stripSkeleton} />
            ) : (
              metrics &&
              metrics.totalInvested > 0 && (
              <View style={dashboardStyles.panelCard}>
                <View style={dashboardStyles.titleRow}>
                  <Text style={dashboardStyles.panelTitle}>Performance metrics</Text>
                  <Text style={dashboardStyles.panelPeriod}>
                    {metrics.firstBuyDate ? formatPeriod(metrics.firstBuyDate) : "N/A"}
                  </Text>
                </View>
                <MetricStrip metrics={metrics} />
              </View>
              )
            )
          ) : (
            <View style={[dashboardStyles.panelCard, dashboardStyles.proLockContainer]}>
              <View style={dashboardStyles.proLockLeft}>
                <View style={dashboardStyles.proIconBadge}>
                  <Icon name="lock-closed-outline" size={16} color={C.purple600} />
                </View>
                <View style={dashboardStyles.proTextContainer}>
                  <Text style={dashboardStyles.stripLabel}>Performance metrics</Text>
                  <Text style={dashboardStyles.proSubtitle}>
                    CAGR, TWR, XIRR, Sharpe ratio, max drawdown and more — Pro only
                  </Text>
                </View>
              </View>
            </View>
          ))}

        {/* Empty state — no transactions */}
        {!loading && metrics && metrics.totalInvested === 0 && (
          <View style={dashboardStyles.noTxnBox}>
            <Text style={dashboardStyles.noTxnTitle}>No transactions yet</Text>
            <Text style={dashboardStyles.noTxnSubtitle}>Add your first buy to start tracking your portfolio.</Text>
            <TouchableOpacity
              style={dashboardStyles.noTxnButton}
              onPress={() =>
                selectedPortfolio &&
                navigation.navigate("Portfolio", {
                  screen: "PortfolioDetail",
                  params: { id: selectedPortfolio.id, name: selectedPortfolio.name },
                })
              }
            >
              <Text style={dashboardStyles.noTxnButtonText}>Go to Transactions</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </>
  );
};

export default DashboardPage;