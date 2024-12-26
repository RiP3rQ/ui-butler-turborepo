import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BillingService } from './billing.service';
import { User } from '@app/common';
import { BalancePackId } from '@repo/types';

@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @GrpcMethod('BillingService', 'SetupUser')
  async setupUser({ user }: { user: User }) {
    return this.billingService.setupUser(user);
  }

  @GrpcMethod('BillingService', 'PurchasePack')
  async purchasePack({ user, packId }: { user: User; packId: BalancePackId }) {
    return this.billingService.purchasePack(user, packId);
  }

  @GrpcMethod('BillingService', 'GetUserCredits')
  async getUserCredits({ user }: { user: User }) {
    return this.billingService.getUserCredits(user);
  }
}
