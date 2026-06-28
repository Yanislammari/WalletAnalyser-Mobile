import BaseService from "./BaseService";

export interface SubscriptionStatus {
  isPro: boolean;
  active: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

class SubscriptionService extends BaseService {
  private static instance: SubscriptionService;

  private constructor() {
    super();
  }

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  public async getStatus(): Promise<SubscriptionStatus> {
    return this.request<SubscriptionStatus>("/subscription/status", { method: "GET" });
  }

  public async createCheckoutSession(): Promise<string> {
    const res = await this.request<{ url: string }>("/subscription/checkout", { method: "POST" });
    return res.url;
  }

  public async createPortalSession(): Promise<string> {
    const res = await this.request<{ url: string }>("/subscription/portal", { method: "POST" });
    return res.url;
  }

  public async cancelSubscription(): Promise<void> {
    await this.request("/subscription/cancel", { method: "POST" });
  }
}

export default SubscriptionService;
