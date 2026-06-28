export const InputMode = {
  AMOUNT: "AMOUNT",
  SHARES: "SHARES",
} as const;

export type InputMode = typeof InputMode[keyof typeof InputMode];
