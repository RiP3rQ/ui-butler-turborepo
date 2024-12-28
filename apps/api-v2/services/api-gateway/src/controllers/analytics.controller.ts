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
  UseInterceptors,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { CurrentUser, JwtAuthGuard } from '@app/common';
import { AnalyticsProto } from '@app/proto';
import { handleGrpcError } from '../utils/grpc-error.util';
import { firstValueFrom } from 'rxjs';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseInterceptors(CacheInterceptor)
@CacheTTL(60000) // 1 minutes cache for all routes in this controller
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
  @ApiOperation({
    summary: 'Get analytics periods',
    description: 'Retrieves available analytics periods for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available analytics periods',
    type: Array,
  })
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
  @ApiOperation({
    summary: 'Get statistics card values',
    description:
      'Retrieves statistical values for dashboard cards for a specific period',
  })
  @ApiQuery({
    name: 'month',
    type: Number,
    required: true,
    description: 'Month number (1-12)',
  })
  @ApiQuery({
    name: 'year',
    type: Number,
    required: true,
    description: 'Year (YYYY)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistical card values',
  })
  @ApiNotFoundResponse({
    description: 'Invalid query parameters or unauthorized',
  })
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
  @ApiOperation({
    summary: 'Get workflow execution statistics',
    description:
      'Retrieves statistics about workflow executions for a specific period',
  })
  @ApiQuery({
    name: 'month',
    type: Number,
    required: true,
    description: 'Month number (1-12)',
  })
  @ApiQuery({
    name: 'year',
    type: Number,
    required: true,
    description: 'Year (YYYY)',
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow execution statistics',
  })
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
  @ApiOperation({
    summary: 'Get used credits for period',
    description: 'Retrieves the amount of credits used in a specific period',
  })
  @ApiQuery({
    name: 'month',
    type: Number,
    required: true,
    description: 'Month number (1-12)',
  })
  @ApiQuery({
    name: 'year',
    type: Number,
    required: true,
    description: 'Year (YYYY)',
  })
  @ApiResponse({
    status: 200,
    description: 'Credit usage statistics',
  })
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
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Retrieves statistical values for the main dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics',
  })
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
  @ApiOperation({
    summary: 'Get favorited components',
    description:
      'Retrieves a list of favorited components for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of favorited components',
  })
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
