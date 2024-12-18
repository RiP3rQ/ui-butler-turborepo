import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BillingService } from './billing.service';
import { User } from '@app/common';
import { BalancePackId } from '@repo/types';

@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @MessagePattern('billing.setup-user')
  async setupUser(@Payload() data: { user: User }) {
    return this.billingService.setupUser(data.user);
  }

  @MessagePattern('billing.purchase-pack')
  async purchasePack(@Payload() data: { user: User; packId: BalancePackId }) {
    return this.billingService.purchasePack(data.user, data.packId);
  }

  @MessagePattern('billing.get-credits')
  async getUserCredits(@Payload() data: { user: User }) {
    return this.billingService.getUserCredits(data.user);
  }
}
