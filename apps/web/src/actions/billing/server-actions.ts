"use server";

import type { BalancePackId, UserBasicCredits } from "@repo/types";
import { BillingService } from "./billing-service";

/**
 * Server action to get available credits
 */
export async function getAvailableCredits(): Promise<UserBasicCredits> {
  return BillingService.getAvailableCredits();
}

/**
 * Server action to purchase credits
 */
export async function purchaseCredits({
  packId,
}: Readonly<{ packId: BalancePackId }>): Promise<UserBasicCredits> {
  return BillingService.purchaseCredits(packId);
}

/**
 * Server action to setup a new user
 */
export async function setupUser(): Promise<void> {
  return BillingService.setupUser();
}
