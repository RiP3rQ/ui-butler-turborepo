import { CurrentUser, JwtAuthGuard } from '@app/common';
import { BillingProto } from '@microservices/proto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  OnModuleInit,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BalancePackId } from '@shared/types';
import { firstValueFrom } from 'rxjs';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';
import { handleGrpcError } from '../utils/grpc-error.util';

/**
 * Controller handling billing-related operations through gRPC communication
 * with the billing microservice.
 * @class BillingController
 */
@ApiTags('Billing')
@ApiBearerAuth()
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

  /**
   * Sets up billing for a new user
   * @param {BillingProto.User} user - The authenticated user
   * @returns {Promise<BillingProto.SetupUserResponse>} Setup confirmation
   * @throws {NotFoundException} When user is undefined
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Setup billing for new user' })
  @ApiResponse({
    status: 200,
    description: 'User billing setup successful',
    type: 'BillingProto.SetupUserResponse',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @Get('setup')
  public async setupUser(
    @CurrentUser() user: BillingProto.User,
  ): Promise<BillingProto.Empty> {
    if (!user?.id) {
      throw new NotFoundException('Unauthorized: User not found');
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

  /**
   * Purchases a credit pack for the user
   * @param {BalancePackId} packId - ID of the pack to purchase
   * @param {BillingProto.User} user - The authenticated user
   * @returns {Promise<BillingProto.UserCreditsResponse>} Updated user credits
   * @throws {NotFoundException} When user or packId is undefined
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Purchase credits pack' })
  @ApiQuery({ name: 'packId', enum: BalancePackId })
  @ApiResponse({
    status: 200,
    description: 'Pack purchased successfully',
    type: 'BillingProto.UserCreditsResponse',
  })
  @ApiResponse({ status: 404, description: 'User or pack not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @Get('purchase')
  public async purchasePack(
    @Query('packId') packId: BalancePackId,
    @CurrentUser() user: BillingProto.User,
  ): Promise<BillingProto.UserCreditsResponse> {
    if (!user?.id) {
      throw new NotFoundException('Unauthorized: User not found');
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

      return await this.grpcClient.call(
        this.billingService.purchasePack(request),
        'Billing.purchasePack',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Retrieves user's current credit balance
   * @param {BillingProto.User} user - The authenticated user
   * @returns {Promise<BillingProto.UserCreditsResponse>} User's current credits
   * @throws {NotFoundException} When user is undefined
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Get user credits balance' })
  @ApiResponse({
    status: 200,
    description: 'Credits retrieved successfully',
    type: 'BillingProto.UserCreditsResponse',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // 5 minutes cache
  @Get('credits')
  public async getUserCredits(
    @CurrentUser() user: BillingProto.User,
  ): Promise<BillingProto.UserCreditsResponse> {
    if (!user?.id) {
      throw new NotFoundException('Unauthorized: User not found');
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
