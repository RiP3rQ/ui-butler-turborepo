import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AnalyticsProto } from '@app/proto';
import { AnalyticsService } from './analytics.service';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @GrpcMethod('AnalyticsService', 'GetPeriods')
  async getPeriods(
    request: AnalyticsProto.GetPeriodsRequest,
  ): Promise<AnalyticsProto.GetPeriodsResponse> {
    const periods = await this.analyticsService.getPeriods(request.user);
    return {
      $type: 'api.analytics.GetPeriodsResponse',
      periods: periods.map((period) => ({
        $type: 'api.analytics.Period',
        ...period,
      })),
    };
  }

  @GrpcMethod('AnalyticsService', 'GetStatCardsValues')
  async getStatCardsValues(
    request: AnalyticsProto.StatCardsRequest,
  ): Promise<AnalyticsProto.StatCardsResponse> {
    const stats = await this.analyticsService.getStatCardsValues(
      request.user,
      request.month,
      request.year,
    );
    return {
      $type: 'api.analytics.StatCardsResponse',
      ...stats,
    };
  }

  @GrpcMethod('AnalyticsService', 'GetWorkflowExecutionStats')
  async getWorkflowExecutionStats(
    request: AnalyticsProto.WorkflowStatsRequest,
  ): Promise<AnalyticsProto.WorkflowStatsResponse> {
    const stats = await this.analyticsService.getWorkflowExecutionStats(
      request.user,
      request.month,
      request.year,
    );
    return {
      $type: 'api.analytics.WorkflowStatsResponse',
      stats: stats.map((stat) => ({
        $type: 'api.analytics.DailyStats',
        ...stat,
      })),
    };
  }

  @GrpcMethod('AnalyticsService', 'GetUsedCreditsInPeriod')
  async getUsedCreditsInPeriod(
    request: AnalyticsProto.UsedCreditsRequest,
  ): Promise<AnalyticsProto.UsedCreditsResponse> {
    const stats = await this.analyticsService.getUsedCreditsInPeriod(
      request.user,
      request.month,
      request.year,
    );
    return {
      $type: 'api.analytics.UsedCreditsResponse',
      stats: stats.map((stat) => ({
        $type: 'api.analytics.DailyStats',
        ...stat,
      })),
    };
  }

  @GrpcMethod('AnalyticsService', 'GetDashboardStatCardsValues')
  async getDashboardStatCardsValues(
    request: AnalyticsProto.DashboardStatsRequest,
  ): Promise<AnalyticsProto.DashboardStatsResponse> {
    const stats = await this.analyticsService.getDashboardStatCardsValues(
      request.user,
    );
    return {
      $type: 'api.analytics.DashboardStatsResponse',
      ...stats,
    };
  }

  @GrpcMethod('AnalyticsService', 'GetFavoritedTableContent')
  async getFavoritedTableContent(
    request: AnalyticsProto.FavoritedContentRequest,
  ): Promise<AnalyticsProto.FavoritedContentResponse> {
    const components = await this.analyticsService.getFavoritedTableContent(
      request.user,
    );

    return {
      $type: 'api.analytics.FavoritedContentResponse',
      components,
    };
  }
}
