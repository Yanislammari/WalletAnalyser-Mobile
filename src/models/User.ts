import type { UserType } from "../enums/UserType";

export interface User {
  id: string;
  email: string;
  password?: string | null;
  googleId?: string | null;
  googlePictureUrl?: string | null;
  firstName: string;
  lastName: string;
  ban: boolean;
  userType: UserType;
  subscribe: boolean;
  activated: boolean;
  timeMsGift: number;
  createdAt: Date;
  updatedAt: Date;
}
