import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";
import { MonthlyDataPoint } from "../../responses/MetricResponse";
import { C } from "../../utils/color";

export const GainChart: React.FC<{ data: MonthlyDataPoint[]; currency: string }> = ({ data }) => {
  if (data.length < 2) {
    return <Text style={styles.emptyChartText}>Not enough data</Text>;
  }

  const gains = data.map((d) => d.netGain);
  const max = Math.max(...gains.map((g) => Math.abs(g)), 1);
  const W = 100;
  const H = 60;
  const barW = Math.max(1.5, W / data.length - 0.5);

  return (
    <View style={{ marginTop: 12 }}>
      <Svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 96 }}>
        <Line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke={C.gray100} strokeWidth={0.5} />
        {data.map((d, i) => {
          const isPosBar = d.netGain >= 0;
          const pct = Math.abs(d.netGain) / max;
          const barH = Math.max(pct * (H / 2 - 2), 0.5);
          const x = i * (W / data.length);
          const y = isPosBar ? H / 2 - barH : H / 2;
          return (
            <Rect
              key={d.month}
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill={isPosBar ? C.purple600 : C.rose500}
              opacity={0.8}
              rx={0.4}
            />
          );
        })}
      </Svg>
      <View style={styles.rowBetween}>
        <Text style={styles.chartAxisLabel}>{data[0]?.month}</Text>
        <Text style={styles.chartAxisLabel}>{data[data.length - 1]?.month}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({ 
  chartCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray100,
    borderRadius: 16,
    padding: 16,
  },
  emptyChartText: { color: C.gray300, fontSize: 12, textAlign: "center", paddingVertical: 24 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  chartAxisLabel: { color: C.gray400, fontSize: 10 },
})