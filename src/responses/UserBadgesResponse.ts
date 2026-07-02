import type { UserBadge } from "../models/Badge";

export interface UserBadgesResponse {
  isNew: boolean;
  userBadge: UserBadge[];
  newBadges: UserBadge[];
  allBadges: string[];
  nextGiftDate : number | null;
}
