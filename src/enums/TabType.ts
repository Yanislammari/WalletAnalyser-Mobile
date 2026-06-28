export const TabType = {
  BUYS: "BUYS",
  SELLS: "SELLS",
  DIVIDENDS: "DIVIDENDS",
} as const;

export type TabType = typeof TabType[keyof typeof TabType];
