export const fmt = (v: number, currency: string, decimals = 2) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: decimals }).format(v);

export const fmtPct = (v: number, decimals = 1) =>
  `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}%`;

export const pos = (v: number) => v >= 0;

export const formatPeriod = (fromDate: string): string => {
  const start = new Date(fromDate);
  const now = new Date();
  const totalDays = Math.round((now.getTime() - start.getTime()) / 86_400_000);
  if (totalDays <= 0) return "Today";
  if (totalDays < 7) return `${totalDays} day${totalDays !== 1 ? "s" : ""}`;
  if (totalDays < 30) {
    const w = Math.floor(totalDays / 7);
    const d = totalDays % 7;
    return d > 0 ? `${w}w ${d}d` : `${w} week${w !== 1 ? "s" : ""}`;
  }
  if (totalDays < 365) {
    const m = Math.round(totalDays / 30.44);
    return `${m} month${m !== 1 ? "s" : ""}`;
  }
  const y = Math.floor(totalDays / 365.25);
  const rem = totalDays - Math.floor(y * 365.25);
  const m = Math.round(rem / 30.44);
  return m > 0 ? `${y}y ${m}m` : `${y} year${y !== 1 ? "s" : ""}`;
};

export type PeriodPreset = "ALL" | "5Y" | "3Y" | "2Y" | "1Y" | "6M" | "3M";
export const PRESET_LABELS: Record<PeriodPreset, string> = {
  ALL: "All time",
  "5Y": "5 years",
  "3Y": "3 years",
  "2Y": "2 years",
  "1Y": "1 year",
  "6M": "6 months",
  "3M": "3 months",
};

export const PRESET_MONTHS: Record<PeriodPreset, number | null> = {
  ALL: null,
  "5Y": 60,
  "3Y": 36,
  "2Y": 24,
  "1Y": 12,
  "6M": 6,
  "3M": 3,
};

export const presetToFromDate = (preset: PeriodPreset): string | undefined => {
  const months = PRESET_MONTHS[preset];
  if (months === null) return undefined;
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().split("T")[0];
};
