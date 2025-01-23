import {
  DATABASE_CONNECTION,
  eq,
  type NeonDatabaseType,
  sql,
  userBalance,
} from '@app/database';
import { status } from '@grpc/grpc-js';
import { BillingProto } from '@microservices/proto';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { BalancePackId, getCreditPackById } from '@shared/types';

@Injectable()
export class BillingService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NeonDatabaseType,
  ) {}

  public async setupUser(
    request: BillingProto.SetupUserRequest,
  ): Promise<void> {
    try {
      if (!request.user) {
        throw new RpcException({
          code: status.INTERNAL,
          message: 'User is required',
        });
      }

      const [balance] = await this.database
        .insert(userBalance)
        .values({
          id: Number(request.user.id),
          balance: 0,
        })
        .returning();

      if (!balance) {
        throw new RpcException({
          code: status.INTERNAL,
          message: 'Failed to create user balance',
        });
      }
    } catch (error: unknown) {
      console.error(`[ERROR] Error setting up user: ${JSON.stringify(error)}`);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async purchasePack(
    request: BillingProto.PurchasePackRequest,
  ): Promise<BillingProto.UserCreditsResponse> {
    try {
      if (!request.user || !request.packId) {
        throw new RpcException({
          code: status.INTERNAL,
          message: 'Invalid request',
        });
      }

      const selectedPack = getCreditPackById(request.packId as BalancePackId);
      if (!selectedPack) {
        throw new BadRequestException('Invalid pack ID');
      }

      const [updated] = await this.database
        .update(userBalance)
        .set({
          balance: sql`${userBalance.balance} + ${selectedPack.credits}`,
        })
        .where(eq(userBalance.id, Number(request.user.id)))
        .returning();

      if (!updated) {
        throw new NotFoundException('User balance not found');
      }

      return {
        $type: 'api.billing.UserCreditsResponse',
        credits: updated.balance ?? 0,
        userId: request.user.id,
      };
    } catch (error: unknown) {
      console.error(`[ERROR] Error purchasing pack: ${JSON.stringify(error)}`);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async getUserCredits(
    request: BillingProto.GetUserCreditsRequest,
  ): Promise<BillingProto.UserCreditsResponse> {
    try {
      if (!request.user) {
        throw new RpcException({
          code: status.INTERNAL,
          message: 'Invalid request',
        });
      }

      const [credits] = await this.database
        .select()
        .from(userBalance)
        .where(eq(userBalance.id, Number(request.user.id)));

      if (!credits) {
        throw new NotFoundException('User balance not found');
      }

      return {
        $type: 'api.billing.UserCreditsResponse',
        credits: credits.balance ?? 0,
        userId: request.user.id,
      };
    } catch (error: unknown) {
      console.error(
        `[ERROR] Error getting user credits: ${JSON.stringify(error)}`,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }
}
