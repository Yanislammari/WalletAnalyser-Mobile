export const LevelBadge = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
  EXPERT: "EXPERT",
} as const;

export type LevelBadge = typeof LevelBadge[keyof typeof LevelBadge];