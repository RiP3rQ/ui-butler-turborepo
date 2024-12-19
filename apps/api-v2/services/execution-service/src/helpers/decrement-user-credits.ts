import { LogCollector } from '@repo/types';
import { and, eq, gte, sql } from 'drizzle-orm';
import { DrizzleDatabase, userBalance } from '@app/database';

export async function decrementUserCredits(
  database: DrizzleDatabase,
  userId: number,
  credits: number,
  logCollector: LogCollector,
): Promise<boolean> {
  try {
    if (!userId || typeof credits !== 'number') {
      console.error('Invalid userId or credits provided');
      logCollector.ERROR('Invalid userId or credits provided');
      return false;
    }

    const [updatedBalance] = await database
      .update(userBalance)
      .set({
        balance: sql`${userBalance.balance}
        -
        ${credits}`,
      })
      .where(and(eq(userBalance.id, userId), gte(userBalance.balance, credits)))
      .returning();

    if (!updatedBalance) {
      throw new Error('Failed to update user balance');
    }

    logCollector.INFO(`This phase consumed ${credits} credits`);
    return true;
  } catch (e) {
    console.error('Error while decrementing user credits', e);
    logCollector.ERROR('Insufficient credits');
    return false;
  }
}
