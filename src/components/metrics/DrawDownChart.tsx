import React from "react";
import Svg, { Defs, LinearGradient, Stop, Line, Path, Polyline, Text as SvgText, } from "react-native-svg";
import { MonthlyDataPoint } from "../../responses/MetricResponse";
import { Dimensions } from "react-native";
import { C } from "../../utils/color";

const SCREEN_WIDTH = Dimensions.get("window").width;

export const DrawdownChart: React.FC<{ data: MonthlyDataPoint[] }> = ({ data }) => {
  if (data.length < 2) return null;

  const values = data.map((d) => d.invested + d.netGain);
  let peak = -Infinity;
  const ddSeries = values.map((v) => {
    if (v > peak) peak = v;
    return peak > 0 ? ((v - peak) / peak) * 100 : 0;
  });

  const minDD = Math.min(...ddSeries);
  const W = 600;
  const H = 80;
  const PAD = { left: 40, right: 8, top: 8, bottom: 20 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const toX = (i: number) => PAD.left + (i / (data.length - 1)) * cW;
  const toY = (v: number) => PAD.top + ((0 - v) / (0 - minDD + 0.1)) * cH;

  const coords = ddSeries.map((v, i) => [toX(i), toY(v)] as [number, number]);
  const areaPath = [
    `M${coords[0][0]},${PAD.top}`,
    ...coords.map(([x, y]) => `L${x},${y}`),
    `L${coords[coords.length - 1][0]},${PAD.top}`,
    "Z",
  ].join(" ");

  const step = Math.max(1, Math.floor((data.length - 1) / 5));
  const xIdxs = new Set<number>([0, data.length - 1]);
  for (let i = step; i < data.length - 1; i += step) xIdxs.add(i);

  const fmtM = (key: string) => {
    const [y, m] = key.split("-");
    return `${["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][Number(m) - 1]}${y.slice(2)}`;
  };

  return (
    <Svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: (SCREEN_WIDTH - 40) * (H / W) }}>
      <Defs>
        <LinearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={C.rose500} stopOpacity={0.3} />
          <Stop offset="100%" stopColor={C.rose500} stopOpacity={0.02} />
        </LinearGradient>
      </Defs>
      <Line x1={PAD.left} x2={W - PAD.right} y1={PAD.top} y2={PAD.top} stroke={C.gray100} strokeWidth={1} />
      <Path d={areaPath} fill="url(#ddGrad)" />
      <Polyline
        points={coords.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none"
        stroke={C.rose500}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <SvgText x={PAD.left - 4} y={PAD.top + cH / 2 + 4} fontSize={9} fill={C.gray300} textAnchor="end">
        {minDD.toFixed(1)}%
      </SvgText>
      <SvgText x={PAD.left - 4} y={PAD.top + 4} fontSize={9} fill={C.gray300} textAnchor="end">
        0%
      </SvgText>
      {data.map((d, i) =>
        !xIdxs.has(i) ? null : (
          <SvgText key={i} x={toX(i)} y={H - 4} fontSize={9} fill={C.gray300} textAnchor="middle">
            {fmtM(d.month)}
          </SvgText>
        )
      )}
    </Svg>
  );
};