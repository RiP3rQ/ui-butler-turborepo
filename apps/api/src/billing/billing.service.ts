import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { User } from '../database/schemas/users';
import type { DrizzleDatabase } from '../database/merged-schemas';
import { userBalance } from '../database/schemas/billing';
import { eq, sql } from 'drizzle-orm';
import {
  BalancePackId,
  getCreditPackById,
  UserBasicCredits,
} from '@shared/types';

@Injectable()
export class BillingService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  // GET /billing/user-setup
  async setupUser(user: User) {
    const [balance] = await this.database
      .insert(userBalance)
      .values({
        userId: user.id,
        balance: 0,
      })
      .returning();

    if (!balance) {
      throw new NotFoundException('User balance not found');
    }

    // return nothing as the user balance is set up
  }

  // GET /billing/purchase?packId=${packId}
  async purchasePack(user: User, packId: string) {
    const selectedPack = getCreditPackById(packId as BalancePackId);

    if (!selectedPack) {
      throw new NotFoundException('Pack not found');
    }

    const [credits] = await this.database
      .update(userBalance)
      .set({
        balance: sql`${userBalance.balance}
        +
        ${selectedPack.credits}`,
      })
      .where(eq(userBalance.id, user.id))
      .returning();

    if (!credits) {
      throw new NotFoundException('Credits not found');
    }

    return {
      credits: credits.balance,
      userId: user.id,
    } satisfies UserBasicCredits;
  }

  // GET /billing/credits
  async getUserCredits(user: User) {
    const [credits] = await this.database
      .select()
      .from(userBalance)
      .where(eq(userBalance.id, user.id));

    if (!credits) {
      throw new NotFoundException('Credits not found');
    }

    return {
      credits: credits.balance,
      userId: user.id,
    } satisfies UserBasicCredits;
  }
}
