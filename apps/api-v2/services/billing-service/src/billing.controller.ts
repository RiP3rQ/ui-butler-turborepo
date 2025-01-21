import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BillingProto } from '@app/proto';
import { BillingService } from './billing.service';

@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @GrpcMethod('BillingService', 'SetupUser')
  public async setupUser(
    request: BillingProto.SetupUserRequest,
  ): Promise<BillingProto.Empty> {
    await this.billingService.setupUser(request);
    return { $type: 'api.billing.Empty' };
  }

  @GrpcMethod('BillingService', 'PurchasePack')
  public async purchasePack(
    request: BillingProto.PurchasePackRequest,
  ): Promise<BillingProto.UserCreditsResponse> {
    return await this.billingService.purchasePack(request);
  }

  @GrpcMethod('BillingService', 'GetUserCredits')
  public async getUserCredits(
    request: BillingProto.GetUserCreditsRequest,
  ): Promise<BillingProto.UserCreditsResponse> {
    return await this.billingService.getUserCredits(request);
  }
}
