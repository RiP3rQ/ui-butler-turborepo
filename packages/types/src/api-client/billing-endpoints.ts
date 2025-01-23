import { type BalancePackId } from "../others/credit-packs";

export interface UserCredits {
  balance: number;
  totalUsed: number;
}

export interface UserBasicCredits {
  userId: number;
  credits: number;
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
