import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@app/common';
import {
  DATABASE_CONNECTION,
  eq,
  type NeonDatabaseType,
  sql,
  userBalance,
} from '@app/database';
import {
  BalancePackId,
  getCreditPackById,
  UserBasicCredits,
} from '@repo/types';

@Injectable()
export class BillingService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NeonDatabaseType,
  ) {}

  public async setupUser(user: User): Promise<void> {
    const [balance] = await this.database
      .insert(userBalance)
      .values({
        userId: user.id,
        balance: 0,
      })
      .returning();

    if (!balance) {
      throw new NotFoundException('Failed to create user balance');
    }
  }

  public async purchasePack(
    user: User,
    packId: BalancePackId,
  ): Promise<UserBasicCredits> {
    const selectedPack = getCreditPackById(packId);
    if (!selectedPack) {
      throw new BadRequestException('Invalid pack ID');
    }

    const [updated] = await this.database
      .update(userBalance)
      .set({
        balance: sql`${userBalance.balance}
        +
        ${selectedPack.credits}`,
      })
      .where(eq(userBalance.id, user.id))
      .returning();

    if (!updated) {
      throw new NotFoundException('User balance not found');
    }

    return {
      credits: updated.balance,
      userId: user.id,
    };
  }

  public async getUserCredits(user: User): Promise<UserBasicCredits> {
    const [credits] = await this.database
      .select()
      .from(userBalance)
      .where(eq(userBalance.id, user.id));

    if (!credits) {
      throw new NotFoundException('User balance not found');
    }

    return {
      credits: credits.balance,
      userId: user.id,
    };
  }
}
