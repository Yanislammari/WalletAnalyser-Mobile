import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
const ICON = {
  trendingUp: "trending-up-outline",
  trendingDown: "trending-down-outline",
  chartBar: "bar-chart-outline",
  banknotes: "cash-outline",
  clock: "time-outline",
  scale: "pulse-outline",
  sparkles: "sparkles-outline",
  infoCircle: "information-circle-outline",
  briefcase: "briefcase-outline",
  arrowPath: "sync-outline",
  calculator: "calculator-outline",
} as const;
import PortfolioService from "../services/PortfolioService";
import { usePortfolio } from "../providers/PortfolioProvider";
import type { MetricResponse } from "../responses/MetricResponse";
import NoPortfolioSelected from "../components/card/NoPortfolioSelected";
import Loading from "../components/loading/Loading";
import { PeriodDropdown } from "../components/metrics/PeriodDropdown";
import { GainChart } from "../components/metrics/GainChart";
import { stylesMetrics } from "../styles/Metrics_style";
import { DrawdownChart } from "../components/metrics/DrawDownChart";
import ErrorCardInApp from "../components/card/ErrorCard";
import { C } from "../utils/color";
import { PeriodPreset, presetToFromDate, PRESET_LABELS, PRESET_MONTHS, fmt, fmtPct, formatPeriod, pos } from "../components/metrics/helper";
import { trackButtonClick } from "../utils/FirebaseTracking";
import { notSubscribeError } from "../constants/notSubscribe";

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  description: string;
  iconName: string;
  positive?: boolean;
  neutral?: boolean;
  tag?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  description,
  iconName,
  positive: isPositive,
  neutral,
  tag,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const color = neutral ? C.gray800 : isPositive ? C.emerald600 : C.rose500;
  const bg = neutral ? C.gray50 : isPositive ? C.emerald50 : C.rose50;
  const iconColor = neutral ? C.gray500 : isPositive ? C.emerald500 : C.rose500;

  return (
    <View style={stylesMetrics.card}>
      <View style={stylesMetrics.cardTopRow}>
        <View style={[stylesMetrics.iconBadge, { backgroundColor: bg }]}>
          <Icon name={iconName} color={iconColor} size={18} />
        </View>
        <View style={stylesMetrics.rowGap}>
          {tag ? (
            <View style={stylesMetrics.tagBadge}>
              <Text style={stylesMetrics.tagBadgeText}>{tag}</Text>
            </View>
          ) : null}
          <TouchableOpacity onPress={() => setShowInfo((v) => !v)} hitSlop={8}>
            <Icon name={ICON.infoCircle} color={showInfo ? C.gray500 : C.gray300} size={16} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={stylesMetrics.cardLabel}>{label}</Text>
      <Text style={[stylesMetrics.cardValue, { color }]}>{value}</Text>
      {subtitle ? <Text style={stylesMetrics.cardSubtitle}>{subtitle}</Text> : null}
      {showInfo && (
        <View style={stylesMetrics.tooltip}>
          <Text style={stylesMetrics.tooltipText}>{description}</Text>
        </View>
      )}
    </View>
  );
};

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <View style={{ marginBottom: 4 }}>
    <Text style={stylesMetrics.sectionTitle}>{title}</Text>
    {subtitle ? <Text style={stylesMetrics.sectionSubtitle}>{subtitle}</Text> : null}
  </View>
);

const Metrics: React.FC = () => {
  const portfolioService = PortfolioService.getInstance();
  const { selectedPortfolio } = usePortfolio();
  const [metrics, setMetrics] = useState<MetricResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodPreset>("ALL");
  const [portfolioStartDate, setPortfolioStartDate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!selectedPortfolio) return;
    setError(null);
    setRefreshing(true)
    const fromDate = presetToFromDate(period);
    portfolioService
      .getMetrics(selectedPortfolio.id, fromDate)
      .then((m) => {
        setMetrics(m);
        if (period === "ALL" && m.firstBuyDate) setPortfolioStartDate(m.firstBuyDate);
      })
      .catch((e) => {
        if(e.message == notSubscribeError) {
          trackButtonClick("Metrics_not_subscribe");
          setError(e.message);
        } else {
          setError("Failed to load metrics. Please try again later.");
        }
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  useEffect(() => {
    if (!selectedPortfolio) return;
    trackButtonClick("Metrics");
    setLoading(true);
    setError(null);
    const fromDate = presetToFromDate(period);
    portfolioService
      .getMetrics(selectedPortfolio.id, fromDate)
      .then((m) => {
        setMetrics(m);
        if (period === "ALL" && m.firstBuyDate) setPortfolioStartDate(m.firstBuyDate);
      })
      .catch((e) => {
        if(e.message == 'You need to subscribe to access this feature.') {
          trackButtonClick("Metrics_not_subscribe");
          setError(e.message);
        } else {
          setError("Failed to load metrics. Please try again later.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedPortfolio, period]);

  useEffect(() => {
    setPeriod("ALL");
    setPortfolioStartDate(null);
  }, [selectedPortfolio]);

  const availablePresets = useMemo((): PeriodPreset[] => {
    if (!portfolioStartDate) return Object.keys(PRESET_LABELS) as PeriodPreset[];
    const ageMonths = (Date.now() - new Date(portfolioStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    return (Object.keys(PRESET_LABELS) as PeriodPreset[]).filter((p) => {
      const months = PRESET_MONTHS[p];
      return months === null || months < ageMonths;
    });
  }, [portfolioStartDate]);

  const cy = metrics?.currencyName ?? "EUR";
  const hasSells = (metrics?.totalReturned ?? 0) - (metrics?.totalDividends ?? 0) > 0.01;

  return (
    <ScrollView style={stylesMetrics.screen} contentContainerStyle={stylesMetrics.screenContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View>
        <Text style={stylesMetrics.h1}>Performance Metrics</Text>
        <Text style={stylesMetrics.h1Subtitle}>In-depth analysis of your portfolio's performance.</Text>
      </View>

      {!selectedPortfolio && (
        <NoPortfolioSelected />
      )}
      {loading && (
        <Loading />
      )}
      {error && (
        <ErrorCardInApp
          iconBg="#f3f4f6"
          icon={<Icon name="close-circle-outline" size={32} color="#9ca3af" />}
          title={error == notSubscribeError ? "Premium content" : "An error occured"}
          description={error}
        />
      )}

      {metrics && !loading && (
        <>
          {/* ── Summary banner ─────────────────────────────────────────────── */}
          <View style={stylesMetrics.banner}>
            <View style={stylesMetrics.bannerTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={stylesMetrics.bannerLabel}>
                  Total P&L {metrics.portfolioMarketValue > 0 ? "(incl. unrealized)" : ""}
                </Text>
                <Text
                  style={[
                    stylesMetrics.bannerValue,
                    {
                      color: pos(metrics.portfolioMarketValue > 0 ? metrics.gainMtm : metrics.gain)
                        ? C.emerald300
                        : C.rose300,
                    },
                  ]}
                >
                  {(metrics.portfolioMarketValue > 0 ? metrics.gainMtm : metrics.gain) >= 0 ? "+" : ""}
                  {fmt(metrics.portfolioMarketValue > 0 ? metrics.gainMtm : metrics.gain, cy, 0)}
                </Text>
                <Text style={stylesMetrics.bannerSubValue}>
                  {metrics.portfolioMarketValue > 0
                    ? `${fmtPct(metrics.gainPercentMtm)} · CAGR ${fmtPct(metrics.cagrMtm)} · XIRR ${fmtPct(metrics.xirrMtm)}`
                    : `${fmtPct(metrics.gainPercent)}`}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={stylesMetrics.bannerLabel}>Period</Text>
                <Text style={stylesMetrics.bannerPeriodValue}>
                  {metrics.firstBuyDate ? formatPeriod(metrics.firstBuyDate) : "—"}
                </Text>
                <PeriodDropdown value={period} options={availablePresets} onChange={setPeriod} />
              </View>
            </View>

            <View style={stylesMetrics.bannerGrid}>
              <View style={stylesMetrics.bannerGridItem}>
                <Text style={stylesMetrics.bannerLabel}>Invested</Text>
                <Text style={stylesMetrics.bannerGridValue}>{fmt(metrics.totalInvested, cy, 0)}</Text>
              </View>
              <View style={stylesMetrics.bannerGridItem}>
                <Text style={stylesMetrics.bannerLabel}>Realized</Text>
                <Text style={stylesMetrics.bannerGridValue}>{fmt(metrics.totalReturned, cy, 0)}</Text>
              </View>
              {metrics.portfolioMarketValue > 0 ? (
                <View style={stylesMetrics.bannerGridItem}>
                  <Text style={stylesMetrics.bannerLabel}>Portfolio Value</Text>
                  <Text style={[stylesMetrics.bannerGridValue, { color: C.emerald300 }]}>
                    {fmt(metrics.portfolioMarketValue, cy, 0)}
                  </Text>
                </View>
              ) : (
                <View style={stylesMetrics.bannerGridItem}>
                  <Text style={stylesMetrics.bannerLabel}>Net Gain</Text>
                  <Text
                    style={[
                      stylesMetrics.bannerGridValue,
                      { color: pos(metrics.gain) ? C.emerald300 : C.rose300 },
                    ]}
                  >
                    {metrics.gain >= 0 ? "+" : ""}
                    {fmt(metrics.gain, cy, 0)}
                  </Text>
                </View>
              )}
              <View style={stylesMetrics.bannerGridItem}>
                <Text style={stylesMetrics.bannerLabel}>Dividends</Text>
                <Text style={stylesMetrics.bannerGridValue}>{fmt(metrics.totalDividends, cy, 0)}</Text>
              </View>
            </View>
          </View>

          {/* ── Returns + Risk ──────────────────────────────────────────────── */}
          {hasSells ? (
            <>
              <View>
                <SectionHeader title="Returns" subtitle="How much value you created from your investments" />
                <View style={stylesMetrics.cardGrid}>
                  <View style={stylesMetrics.cardGridItem}>
                  <MetricCard
                    label="Total P&L"
                    value={fmtPct(metrics.portfolioMarketValue > 0 ? metrics.gainPercentMtm : metrics.gainPercent)}
                    subtitle={`${(metrics.portfolioMarketValue > 0 ? metrics.gainMtm : metrics.gain) >= 0 ? "+" : ""}${fmt(metrics.portfolioMarketValue > 0 ? metrics.gainMtm : metrics.gain, cy, 0)}${metrics.portfolioMarketValue > 0 ? " · incl. unrealized" : " · cash flows only"}`}
                    description="Total return on invested capital. When open positions exist, includes current market value of held shares (mark-to-market). Otherwise computed from realized cash flows only."
                    iconName={pos(metrics.gainPercent) ? ICON.trendingUp : ICON.trendingDown}
                      positive={pos(metrics.portfolioMarketValue > 0 ? metrics.gainPercentMtm : metrics.gainPercent)}
                    />
                  </View>
                  <View style={stylesMetrics.cardGridItem}>
                    <MetricCard
                      label="CAGR"
                      value={fmtPct(metrics.portfolioMarketValue > 0 ? metrics.cagrMtm : metrics.cagr)}
                      subtitle="per year, compounded"
                      description="Compound Annual Growth Rate — the equivalent fixed annual return that would take your invested capital to the realized return over the same period. Meaningful only with 1+ year of history."
                      iconName={ICON.chartBar}
                      positive={pos(metrics.portfolioMarketValue > 0 ? metrics.cagrMtm : metrics.cagr)}
                    />
                  </View>
                  <View style={stylesMetrics.cardGridItem}>
                    <MetricCard
                      label="TWR"
                      value={fmtPct(metrics.twr)}
                      subtitle={`${fmtPct(metrics.twrAnnualized)} / yr`}
                      description="Time-Weighted Return — chains monthly sub-period returns together so new deposits don't distort the measure. Annualized = equivalent fixed yearly rate."
                      iconName={ICON.arrowPath}
                      positive={pos(metrics.twr)}
                      tag="chain-linked"
                    />
                  </View>
                  <View style={stylesMetrics.cardGridItem}>
                    <MetricCard
                      label="Log Return (TWR)"
                      value={`${metrics.logTwr.toFixed(1)}%`}
                      subtitle="continuously compounded"
                      description="ln(1 + TWR/100) × 100. The continuously compounded equivalent of the TWR. Log returns are additive over time."
                      iconName={ICON.calculator}
                      positive={pos(metrics.logTwr)}
                      tag="continuous"
                    />
                  </View>
                  <View style={stylesMetrics.cardGridItem}>
                    <MetricCard
                      label="XIRR"
                      value={fmtPct(metrics.xirrMtm)}
                      subtitle="per year, time-weighted cash flows"
                      description="Internal Rate of Return accounting for the exact dates of every buy, sell, and dividend. More accurate than CAGR when flows are irregular."
                      iconName={ICON.calculator}
                      positive={pos(metrics.xirrMtm)}
                      tag="IRR"
                    />
                  </View>
                </View>
              </View>

              <View>
                <SectionHeader
                  title="Risk"
                  subtitle="How much your portfolio fluctuates and how well you are compensated for it"
                />
                <View style={stylesMetrics.cardGrid}>
                  <View style={stylesMetrics.cardGridItem}>
                    <MetricCard
                      label="Volatility"
                      value={`${metrics.volatility.toFixed(1)}%`}
                      subtitle="annualized, monthly std dev"
                      description="Standard deviation of monthly returns × √12. Measures how much your realized returns swing up and down each month. Lower = more stable."
                      iconName={ICON.scale}
                      neutral
                    />
                  </View>
                  <View style={stylesMetrics.cardGridItem}>
                    <MetricCard
                      label="Sharpe Ratio"
                      value={metrics.sharpeRatio.toFixed(1)}
                      subtitle="(TWR − 4% rf) ÷ volatility"
                      description="Risk-adjusted return: (annualized TWR − risk-free rate) ÷ annualized volatility. Above 1 = good, above 2 = excellent, below 0 = risk isn't compensated."
                      iconName={ICON.sparkles}
                      positive={metrics.sharpeRatio >= 1}
                      neutral={metrics.sharpeRatio > 0 && metrics.sharpeRatio < 1}
                      tag="risk-adj."
                    />
                  </View>
                  <View style={stylesMetrics.cardGridItem}>
                    <MetricCard
                      label="Sortino Ratio"
                      value={metrics.sortinoRatio.toFixed(1)}
                      subtitle="downside deviation only"
                      description="Like Sharpe but divides by downside deviation — only months below the risk-free rate count as 'risk'. Penalizes harmful volatility, not upside swings."
                      iconName={ICON.sparkles}
                      positive={metrics.sortinoRatio >= 1}
                      neutral={metrics.sortinoRatio > 0 && metrics.sortinoRatio < 1}
                      tag="risk-adj."
                    />
                  </View>
                  <View style={stylesMetrics.cardGridItem}>
                    <MetricCard
                      label="Max Drawdown"
                      value={`-${metrics.maxDrawdown.toFixed(1)}%`}
                      subtitle={
                        metrics.maxDrawdownDurationMonths > 0
                          ? `${metrics.maxDrawdownDurationMonths} month${metrics.maxDrawdownDurationMonths !== 1 ? "s" : ""} duration`
                          : "—"
                      }
                      description="The largest peak-to-trough decline in your realized portfolio value. Measures worst-case loss before a new high was reached."
                      iconName={ICON.trendingDown}
                      positive={metrics.maxDrawdown === 0}
                      neutral={metrics.maxDrawdown > 0 && metrics.maxDrawdown < 10}
                    />
                  </View>
                  {/* ── Income ──────────────────────────────────────────────────────── */}
                  <View>
                    <SectionHeader title="Income" subtitle="Dividends received from your holdings" />
                    <View style={stylesMetrics.cardGrid}>
                      <View style={stylesMetrics.cardGridItemFull}>
                        <MetricCard
                          label="Dividend Income"
                          value={fmt(metrics.totalDividends, cy, 0)}
                          subtitle={`Yield: ${metrics.dividendYield.toFixed(2)}%`}
                          description="Total dividends received, converted to your target currency. Yield = dividends ÷ total invested."
                          iconName={ICON.banknotes}
                          positive={metrics.totalDividends > 0}
                          neutral={metrics.totalDividends === 0}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={stylesMetrics.cardGridItem}>
                    <MetricCard
                      label="Period"
                      value={metrics.firstBuyDate ? formatPeriod(metrics.firstBuyDate) : "—"}
                      subtitle={metrics.firstBuyDate ? `Since ${metrics.firstBuyDate}` : "No buys yet"}
                      description="Time window of the selected period. The longer the period, the more reliable all other metrics become — especially CAGR, Sharpe, and Sortino."
                      iconName={ICON.clock}
                      neutral
                    />
                  </View>
                </View>
              </View>
            </>
          ) : (
            <View style={stylesMetrics.noSellsBox}>
              <View style={stylesMetrics.noSellsIconBadge}>
                <Icon name={ICON.trendingUp} color={C.purple400} size={24} />
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={stylesMetrics.noSellsTitle}>Sell transactions required</Text>
                <Text style={stylesMetrics.noSellsSubtitle}>
                  Realized P&L, CAGR, TWR, XIRR, Volatility, Sharpe and Sortino are computed from cash
                  flows only. Add at least one sell transaction to unlock these metrics.
                </Text>
              </View>
            </View>
          )}

          {/* ── Methodology note ────────────────────────────────────────────── */}
          <View style={stylesMetrics.noteBox}>
            <Icon name={ICON.infoCircle} color={C.amber500} size={16} style={{ marginTop: 2 }} />
            <Text style={stylesMetrics.noteText}>
              <Text style={stylesMetrics.noteTextBold}>Total P&L, CAGR, and XIRR</Text> (banner above) include
              the current market value of held positions — this is the true economic performance.
              {hasSells && (
                <Text>
                  {" "}
                  <Text style={stylesMetrics.noteTextBold}>Realized P&L</Text> counts only cash already received
                  (sells + dividends).
                </Text>
              )}
              {" "}All amounts are converted to {cy}.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default Metrics;
