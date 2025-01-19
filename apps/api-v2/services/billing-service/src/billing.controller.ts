import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { User } from '@app/common';
import { BalancePackId } from '@repo/types';
import { BillingService } from './billing.service';

@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @GrpcMethod('BillingService', 'SetupUser')
  public async setupUser({ user }: { user: User }) {
    return this.billingService.setupUser(user);
  }

  @GrpcMethod('BillingService', 'PurchasePack')
  public async purchasePack({
    user,
    packId,
  }: {
    user: User;
    packId: BalancePackId;
  }) {
    return this.billingService.purchasePack(user, packId);
  }

  @GrpcMethod('BillingService', 'GetUserCredits')
  public async getUserCredits({ user }: { user: User }) {
    return this.billingService.getUserCredits(user);
  }
}
