import { AnalyticsProto } from '@microservices/proto';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AnalyticsService } from './analytics.service';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @GrpcMethod('AnalyticsService', 'GetPeriods')
  public async getPeriods(
    request: AnalyticsProto.GetPeriodsRequest,
  ): Promise<AnalyticsProto.GetPeriodsResponse> {
    console.log('getPeriods', request);
    if (!request.user) {
      throw new Error('User is required');
    }
    const periods = await this.analyticsService.getPeriods(request.user);
    return {
      $type: 'api.analytics.GetPeriodsResponse',
      periods: periods.map((period) => ({
        ...period,
      })),
    };
  }

  @GrpcMethod('AnalyticsService', 'GetStatCardsValues')
  public async getStatCardsValues(
    request: AnalyticsProto.StatCardsRequest,
  ): Promise<AnalyticsProto.StatCardsResponse> {
    console.log('getStatCardsValues', request);
    if (!request.user) {
      throw new Error('User is required');
    }
    const stats = await this.analyticsService.getStatCardsValues(
      request.user,
      request.month,
      request.year,
    );
    return {
      ...stats,
    };
  }

  @GrpcMethod('AnalyticsService', 'GetWorkflowExecutionStats')
  public async getWorkflowExecutionStats(
    request: AnalyticsProto.WorkflowStatsRequest,
  ): Promise<AnalyticsProto.WorkflowStatsResponse> {
    console.log('getWorkflowExecutionStats', request);
    if (!request.user) {
      throw new Error('User is required');
    }
    const stats = await this.analyticsService.getWorkflowExecutionStats(
      request.user,
      request.month,
      request.year,
    );
    return {
      $type: 'api.analytics.WorkflowStatsResponse',
      stats: stats.map((stat) => ({
        ...stat,
      })),
    };
  }

  @GrpcMethod('AnalyticsService', 'GetUsedCreditsInPeriod')
  public async getUsedCreditsInPeriod(
    request: AnalyticsProto.UsedCreditsRequest,
  ): Promise<AnalyticsProto.UsedCreditsResponse> {
    console.log('getUsedCreditsInPeriod', request);
    if (!request.user) {
      throw new Error('User is required');
    }
    const stats = await this.analyticsService.getUsedCreditsInPeriod(
      request.user,
      request.month,
      request.year,
    );
    return {
      $type: 'api.analytics.UsedCreditsResponse',
      stats: stats.map((stat) => ({
        ...stat,
      })),
    };
  }

  @GrpcMethod('AnalyticsService', 'GetDashboardStatCardsValues')
  public async getDashboardStatCardsValues(
    request: AnalyticsProto.DashboardStatsRequest,
  ): Promise<AnalyticsProto.DashboardStatsResponse> {
    console.log('getDashboardStatCardsValues', request);
    if (!request.user) {
      throw new Error('User is required');
    }
    const stats = await this.analyticsService.getDashboardStatCardsValues(
      request.user,
    );
    return {
      ...stats,
    };
  }

  @GrpcMethod('AnalyticsService', 'GetFavoritedTableContent')
  public async getFavoritedTableContent(
    request: AnalyticsProto.FavoritedContentRequest,
  ): Promise<AnalyticsProto.FavoritedContentResponse> {
    console.log('getFavoritedTableContent', request);
    if (!request.user) {
      throw new Error('User is required');
    }
    const components = await this.analyticsService.getFavoritedTableContent(
      request.user,
    );

    return {
      $type: 'api.analytics.FavoritedContentResponse',
      components,
    };
  }
}
