"use server";

import type {
  BalancePackId,
  BillingEndpoints,
  UserCredits,
} from "@shared/types";
import { BillingService } from "./billing-service";

/**
 * Server action to get available credits
 */
export async function getAvailableCredits(): Promise<UserCredits> {
  return BillingService.getAvailableCredits();
}

/**
 * Server action to purchase credits
 */
export async function purchaseCredits({
  packId,
}: Readonly<{ packId: BalancePackId }>): Promise<UserCredits> {
  return BillingService.purchaseCredits(packId);
}

/**
 * Server action to setup a new user
 */
export async function setupUser(): Promise<
  BillingEndpoints["setup"]["response"]
> {
  return BillingService.setupUser();
}
