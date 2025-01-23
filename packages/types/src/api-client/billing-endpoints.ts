import { type BalancePackId } from "../others/credit-packs";

export interface UserCredits {
  credits: number;
  userId: string;
}

export interface BillingEndpoints {
  /** GET /billing/setup */
  setup: {
    response: {
      customerId: string;
      status: string;
    };
  };

  /** GET /billing/purchase */
  purchase: {
    query: {
      packId: BalancePackId;
    };
    response: UserCredits;
  };

  /** GET /billing/credits */
  credits: {
    response: UserCredits;
  };
}
