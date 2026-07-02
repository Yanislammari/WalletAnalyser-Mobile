import type { UserBadgesResponse } from "../responses/UserBadgesResponse";
import BaseService from "./BaseService";

class BadgeService extends BaseService {
  private static instance: BadgeService;

  private constructor() {
    super();
  }

  public static getInstance(): BadgeService {
    if (!BadgeService.instance) {
      BadgeService.instance = new BadgeService();
    }
    return BadgeService.instance;
  }

  public async getAll(): Promise<UserBadgesResponse> {
    return this.request<UserBadgesResponse>("/badges", {
      method: "GET" 
    });
  }
}

export default BadgeService;