import React, { useMemo, useRef, useState } from "react";
import { View, Text as RNText, TouchableOpacity, StyleSheet } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Line,
  Path,
  Polyline,
  Circle,
  Text as SvgText,
  G,
} from "react-native-svg";
import type { MonthlyDataPoint } from "../../responses/MetricResponse";
import { C } from "../../utils/color";


const PERIODS = ["3M", "6M", "1Y", "All"] as const;
type Period = typeof PERIODS[number];
const PERIOD_MONTHS: Record<Period, number | null> = { "3M": 3, "6M": 6, "1Y": 12, All: null };

interface DmLineChartProps {
  data: MonthlyDataPoint[];
  currency: string;
}

const DmLineChart: React.FC<DmLineChartProps> = ({ data, currency }) => {
  const [period, setPeriod] = useState<Period>("1Y");
  const [hovered, setHovered] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Track the absolute screen X coordinate of the container
  const containerPageX = useRef<number>(0);

  const sliced = useMemo(() => {
    const n = PERIOD_MONTHS[period];
    return n ? data.slice(-n) : data;
  }, [data, period]);

  // Fallback to the latest data point (closest to today) if nothing is hovered
  const activeIdx = hovered !== null ? hovered : sliced.length - 1;

  const fmt = (v: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);

  const fmtShort = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
    return v.toFixed(0);
  };

  const fmtMonth = (key: string) => {
    const [y, m] = key.split("-");
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${names[Number(m) - 1]} ${y.slice(2)}`;
  };

  const W = 400;
  const totalH = 140;

  const PeriodTabs = () => (
    <View style={styles.tabsRow}>
      {PERIODS.map((p) => (
        <TouchableOpacity
          key={p}
          onPress={() => {
            setPeriod(p);
            setHovered(null);
          }}
          style={[styles.tab, period === p && styles.tabActive]}
        >
          <RNText style={[styles.tabText, period === p && styles.tabTextActive]}>{p}</RNText>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (sliced.length < 2) {
    return (
      <View>
        <View style={styles.headerRow}>
          <RNText style={styles.headerLabel}>Portfolio value over time</RNText>
          <PeriodTabs />
        </View>
        <View style={styles.emptyBox}>
          <RNText style={styles.emptyText}>Not enough data for this period</RNText>
        </View>
      </View>
    );
  }

  const PAD = { left: 38, right: 8, top: 8, bottom: 24 };
  const cW = W - PAD.left - PAD.right;
  const cH = totalH - PAD.top - PAD.bottom;

  const portfolioVals = sliced.map((d) => d.invested + d.netGain);
  const minV = Math.min(...portfolioVals);
  const maxV = Math.max(...portfolioVals);
  const range = maxV - minV || 1;
  const pad = range * 0.1;

  const toX = (i: number) => PAD.left + (i / (sliced.length - 1)) * cW;
  const toY = (v: number) => PAD.top + cH - ((v - (minV - pad)) / (range + 2 * pad)) * cH;

  const pCoords: [number, number][] = portfolioVals.map((v, i) => [toX(i), toY(v)]);
  const ptStr = (cs: [number, number][]) => cs.map(([x, y]) => `${x},${y}`).join(" ");

  const areaPath = [
    `M${pCoords[0][0]},${pCoords[0][1]}`,
    ...pCoords.slice(1).map(([x, y]) => `L${x},${y}`),
    `L${pCoords[pCoords.length - 1][0]},${PAD.top + cH}`,
    `L${pCoords[0][0]},${PAD.top + cH}`,
    "Z",
  ].join(" ");

  const lastGain = sliced[sliced.length - 1].netGain;
  const lineColor = lastGain >= 0 ? C.purple700 : C.rose500;

  const yTicks = [minV, (minV + maxV) / 2, maxV];

  const xStep = Math.max(1, Math.floor((sliced.length - 1) / 4));
  const xIdxSet = new Set<number>([0, sliced.length - 1]);
  for (let i = xStep; i < sliced.length - 1; i += xStep) xIdxSet.add(i);

  // Optimized Touch Handler: Only updates state when crossing data thresholds
  const handleTouch = (pageX: number) => {
    if (!containerWidth || !containerPageX.current) return;
    
    const localX = pageX - containerPageX.current;
    const xInViewBox = (localX / containerWidth) * W;
    const raw = ((xInViewBox - PAD.left) / cW) * (sliced.length - 1);
    const newIdx = Math.max(0, Math.min(sliced.length - 1, Math.round(raw)));
    
    // Prevent repetitive state sets on the same item during granular movements
    if (newIdx !== hovered) {
      setHovered(newIdx);
    }
  };

  return (
    <View>
      {/* Header with period buttons */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <RNText style={styles.headerLabel}>Portfolio value over time</RNText>
          {activeIdx !== null && sliced[activeIdx] && (
            <RNText style={styles.hoverInfo}>
              {fmtMonth(sliced[activeIdx].month)} · {fmt(sliced[activeIdx].invested + sliced[activeIdx].netGain)}{" "}
              <RNText style={{ color: sliced[activeIdx].netGain >= 0 ? C.emerald600 : C.rose500 }}>
                ({sliced[activeIdx].netGain >= 0 ? "+" : ""}
                {fmt(sliced[activeIdx].netGain)})
              </RNText>
            </RNText>
          )}
        </View>
        <PeriodTabs />
      </View>

      {/* Chart container with capture logic and absolute layouts */}
        <View
          onLayout={(e) => {
            setContainerWidth(e.nativeEvent.layout.width);
            e.currentTarget.measure((x, y, width, height, pageX) => {
              containerPageX.current = pageX;
            });
          }}
          onStartShouldSetResponderCapture={() => true}
          onMoveShouldSetResponderCapture={() => true}
          
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(e) => {
            handleTouch(e.nativeEvent.pageX);
          }}
          onResponderMove={(e) => {
            handleTouch(e.nativeEvent.pageX);
          }}
          onResponderTerminationRequest={() => false}
        >
        <Svg viewBox={`0 0 ${W} ${totalH}`} style={{ width: "100%", aspectRatio: W / totalH }}>
          <Defs>
            <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
              <Stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {/* Grid + Y labels */}
          {yTicks.map((v, i) => (
            <G key={i}>
              <Line x1={PAD.left} x2={W - PAD.right} y1={toY(v)} y2={toY(v)} stroke={C.gray100} strokeWidth={1} />
              <SvgText x={PAD.left - 4} y={toY(v) + 3.5} fontSize={9} fill={C.gray300} textAnchor="end">
                {fmtShort(v)}
              </SvgText>
            </G>
          ))}

          {/* Area fill */}
          <Path d={areaPath} fill="url(#areaGrad)" />

          {/* Portfolio value line */}
          <Polyline
            points={ptStr(pCoords)}
            fill="none"
            stroke={lineColor}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Last point dot */}
          <Circle cx={pCoords[pCoords.length - 1][0]} cy={pCoords[pCoords.length - 1][1]} r={4} fill={lineColor} />

          {/* X labels */}
          {sliced.map((d, i) =>
            !xIdxSet.has(i) ? null : (
              <SvgText key={i} x={toX(i)} y={totalH - 6} fontSize={9} fill={C.gray400} textAnchor="middle">
                {fmtMonth(d.month)}
              </SvgText>
            )
          )}

          {/* Hover / touch indicator */}
          {activeIdx !== null && pCoords[activeIdx] && (
            <G>
              <Line
                x1={toX(activeIdx)}
                x2={toX(activeIdx)}
                y1={PAD.top}
                y2={PAD.top + cH}
                stroke={lineColor}
                strokeWidth={1}
                strokeDasharray="3 2"
                opacity={0.4}
              />
              <Circle cx={pCoords[activeIdx][0]} cy={pCoords[activeIdx][1]} r={4} fill={lineColor} />
            </G>
          )}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: lineColor }]} />
          <RNText style={styles.legendText}>Net returns</RNText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 },
  headerLabel: { color: C.gray400, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontWeight: "500" },
  hoverInfo: { color: C.gray600, fontSize: 11, fontWeight: "600", marginTop: 2 },

  tabsRow: { flexDirection: "row", gap: 4 },
  tab: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tabActive: { backgroundColor: C.purple100 },
  tabText: { fontSize: 11, fontWeight: "500", color: C.gray400 },
  tabTextActive: { color: C.purple700 },

  emptyBox: { height: 112, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 12, color: C.gray300 },

  legendRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendSwatch: { width: 20, height: 2, borderRadius: 2 },
  legendText: { fontSize: 9, color: C.gray400 },
});

export default DmLineChart;
