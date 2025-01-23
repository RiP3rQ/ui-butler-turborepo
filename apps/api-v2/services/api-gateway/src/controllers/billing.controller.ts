import { CurrentUser, JwtAuthGuard } from '@app/common';
import { BillingProto } from '@microservices/proto';
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
import { BalancePackId } from '@shared/types';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';
import { handleGrpcError } from '../utils/grpc-error.util';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController implements OnModuleInit {
  private billingService: BillingProto.BillingServiceClient;

  constructor(
    @Inject('BILLING_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {}

  public onModuleInit(): void {
    this.billingService =
      this.client.getService<BillingProto.BillingServiceClient>(
        'BillingService',
      );
  }

  @Get('setup')
  public async setupUser(@CurrentUser() user: BillingProto.User) {
    if (typeof user === 'undefined') {
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

      return await this.grpcClient.call(
        this.billingService.setupUser(request),
        'Billing.setupUser',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Get('purchase')
  public async purchasePack(
    @Query('packId') packId: BalancePackId,
    @CurrentUser() user: BillingProto.User,
  ): Promise<BillingProto.UserCreditsResponse> {
    if (typeof user === 'undefined') {
      throw new NotFoundException('Unauthorized');
    }

    if (typeof packId === 'undefined') {
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

      return await this.grpcClient.call(
        this.billingService.purchasePack(request),
        'Billing.purchasePack',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Get('credits')
  public async getUserCredits(@CurrentUser() user: BillingProto.User) {
    if (typeof user === 'undefined') {
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

      return await this.grpcClient.call(
        this.billingService.getUserCredits(request),
        'Billing.getUserCredits',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
