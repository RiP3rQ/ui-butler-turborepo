import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CurrentUser, JwtAuthGuard, type User } from '@app/common';
import { BalancePackId } from '@repo/types';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    @Inject('BILLING_SERVICE') private readonly billingClient: ClientProxy,
  ) {}

  @Get('setup')
  async setupUser(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    return firstValueFrom(
      this.billingClient.send('billing.setup-user', { user }),
    );
  }

  @Get('purchase')
  async purchasePack(
    @Query('packId') packId: BalancePackId,
    @CurrentUser() user: User,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!packId) {
      throw new NotFoundException('Invalid pack ID provided');
    }

    return firstValueFrom(
      this.billingClient.send('billing.purchase-pack', { user, packId }),
    );
  }

  @Get('credits')
  async getUserCredits(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    return firstValueFrom(
      this.billingClient.send('billing.get-credits', { user }),
    );
  }
}
