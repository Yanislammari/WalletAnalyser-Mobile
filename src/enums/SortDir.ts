export const SortDir = {
  ASC: "ASC",
  DESC: "DESC",
} as const;

export type SortDir = typeof SortDir[keyof typeof SortDir];
