// controllers/analytics.controller.ts
import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  OnModuleInit,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { CurrentUser, JwtAuthGuard } from '@app/common';
import { AnalyticsProto } from '@app/proto';
import { handleGrpcError } from '../utils/grpc-error.util';
import { firstValueFrom } from 'rxjs';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController implements OnModuleInit {
  private analyticsService: AnalyticsProto.AnalyticsServiceClient;

  constructor(
    @Inject('ANALYTICS_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.analyticsService =
      this.client.getService<AnalyticsProto.AnalyticsServiceClient>(
        'AnalyticsService',
      );
  }

  @Get('periods')
  async getPeriods(@CurrentUser() user: AnalyticsProto.User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    try {
      const request: AnalyticsProto.GetPeriodsRequest = {
        $type: 'api.analytics.GetPeriodsRequest',
        user: {
          $type: 'api.analytics.User',
          id: user.id,
          email: user.email,
        },
      };

      const response = await firstValueFrom(
        this.analyticsService.getPeriods(request),
      );
      return response.periods;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Get('stat-cards-values')
  async getStatCardsValues(
    @Query('month', new ParseIntPipe()) month: number,
    @Query('year', new ParseIntPipe()) year: number,
    @CurrentUser() user: AnalyticsProto.User,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!month || !year) {
      throw new NotFoundException('Invalid query parameters provided');
    }

    try {
      const request: AnalyticsProto.StatCardsRequest = {
        $type: 'api.analytics.StatCardsRequest',
        user: {
          $type: 'api.analytics.User',
          id: user.id,
          email: user.email,
        },
        month,
        year,
      };

      return await firstValueFrom(
        this.analyticsService.getStatCardsValues(request),
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Get('workflow-execution-stats')
  async getWorkflowExecutionStats(
    @Query('month', new ParseIntPipe()) month: number,
    @Query('year', new ParseIntPipe()) year: number,
    @CurrentUser() user: AnalyticsProto.User,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!month || !year) {
      throw new NotFoundException('Invalid query parameters provided');
    }

    try {
      const request: AnalyticsProto.WorkflowStatsRequest = {
        $type: 'api.analytics.WorkflowStatsRequest',
        user: {
          $type: 'api.analytics.User',
          id: user.id,
          email: user.email,
        },
        month,
        year,
      };

      const response = await firstValueFrom(
        this.analyticsService.getWorkflowExecutionStats(request),
      );

      return response.stats;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Get('used-credits-in-period')
  async getUsedCreditsInPeriod(
    @Query('month', new ParseIntPipe()) month: number,
    @Query('year', new ParseIntPipe()) year: number,
    @CurrentUser() user: AnalyticsProto.User,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!month || !year) {
      throw new NotFoundException('Invalid query parameters provided');
    }

    try {
      const request: AnalyticsProto.UsedCreditsRequest = {
        $type: 'api.analytics.UsedCreditsRequest',
        user: {
          $type: 'api.analytics.User',
          id: user.id,
          email: user.email,
        },
        month,
        year,
      };

      const response = await firstValueFrom(
        this.analyticsService.getUsedCreditsInPeriod(request),
      );

      return response.stats;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Get('dashboard-stat-cards-values')
  async getDashboardStatCardsValues(@CurrentUser() user: AnalyticsProto.User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    try {
      const request: AnalyticsProto.DashboardStatsRequest = {
        $type: 'api.analytics.DashboardStatsRequest',
        user: {
          $type: 'api.analytics.User',
          id: user.id,
          email: user.email,
        },
      };

      return await firstValueFrom(
        this.analyticsService.getDashboardStatCardsValues(request),
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  @Get('favorited-table-content')
  async getFavoritedTableContent(@CurrentUser() user: AnalyticsProto.User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    try {
      const request: AnalyticsProto.FavoritedContentRequest = {
        $type: 'api.analytics.FavoritedContentRequest',
        user: {
          $type: 'api.analytics.User',
          id: user.id,
          email: user.email,
        },
      };

      const response = await firstValueFrom(
        this.analyticsService.getFavoritedTableContent(request),
      );

      return response.components;
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
