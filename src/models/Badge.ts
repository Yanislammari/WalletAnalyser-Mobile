import type { LevelBadge } from "../enums/LevelBadge"

export interface Badge {
  uuid: string,
  badge_image_path: string,
  badge_title: string,
  badge_label: string,
  created_at: Date,
  updated_at: Date
}

export interface UserBadge {
  uuid: string,
  level_badge: LevelBadge,
  badge : Badge
  createdAt: Date,
  updatedAt: Date
}