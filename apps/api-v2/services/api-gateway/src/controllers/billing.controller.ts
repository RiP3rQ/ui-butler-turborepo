import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  OnModuleInit,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { CurrentUser, JwtAuthGuard } from '@app/common';
import { BillingProto } from '@app/proto';
import { handleGrpcError } from '../utils/grpc-error.util';
import { firstValueFrom } from 'rxjs';
import { BalancePackId } from '@repo/types';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController implements OnModuleInit {
  private billingService: BillingProto.BillingServiceClient;

  constructor(@Inject('BILLING_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.billingService =
      this.client.getService<BillingProto.BillingServiceClient>(
        'BillingService',
      );
  }

  @Get('setup')
  async setupUser(@CurrentUser() user: BillingProto.User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    try {
      const request: BillingProto.SetupUserRequest = {
        $type: 'api.billing.SetupUserRequest',
        user: {
          $type: 'api.billing.User',
          id: user.id,
          email: user.email,
        },
      };

      return await firstValueFrom(this.billingService.setupUser(request));
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Get('purchase')
  async purchasePack(
    @Query('packId') packId: BalancePackId,
    @CurrentUser() user: BillingProto.User,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!packId) {
      throw new NotFoundException('Invalid pack ID provided');
    }

    try {
      const request: BillingProto.PurchasePackRequest = {
        $type: 'api.billing.PurchasePackRequest',
        user: {
          $type: 'api.billing.User',
          id: user.id,
          email: user.email,
        },
        packId,
      };

      return await firstValueFrom(this.billingService.purchasePack(request));
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Get('credits')
  async getUserCredits(@CurrentUser() user: BillingProto.User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    try {
      const request: BillingProto.GetUserCreditsRequest = {
        $type: 'api.billing.GetUserCreditsRequest',
        user: {
          $type: 'api.billing.User',
          id: user.id,
          email: user.email,
        },
      };

      return await firstValueFrom(this.billingService.getUserCredits(request));
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
