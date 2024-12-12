import {
  Controller,
  Get,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { LogErrors } from '../common/error-handling/log-errors.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { User } from '../database/schemas/users';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // GET /billing/user-setup
  @Get('/user-setup')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  setupUser(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.billingService.setupUser(user);
  }

  // GET /billing/purchase-pack?packId=${packId}
  @Get('/purchase-pack')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  purchasePack(@CurrentUser() user: User, @Query('packId') packId: string) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.billingService.purchasePack(user, Number(packId));
  }

  // GET /billing/credits
  @Get('/credits')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getUserCredits(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.billingService.getUserCredits(user);
  }
}
