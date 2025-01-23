// controllers/analytics.controller.ts
import { CurrentUser, JwtAuthGuard } from '@microservices/common';
import { AnalyticsProto } from '@microservices/proto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
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
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';
import { handleGrpcError } from '../utils/grpc-error.util';

/**
 * Controller handling analytics-related operations through gRPC communication
 * with the Analytics microservice.
 * @class AnalyticsController
 */
@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard)
export class AnalyticsController implements OnModuleInit {
  private analyticsService: AnalyticsProto.AnalyticsServiceClient;

  constructor(
    @Inject('ANALYTICS_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {}

  public onModuleInit(): void {
    this.analyticsService =
      this.client.getService<AnalyticsProto.AnalyticsServiceClient>(
        'AnalyticsService',
      );
  }

  /**
   * Retrieves available analytics periods for the current user
   * @param user - Current authenticated user
   * @returns Promise<AnalyticsProto.Period[]> Array of available periods
   */
  @Get('periods')
  @CacheTTL(300000) // 5 minutes cache
  @ApiOperation({
    summary: 'Get analytics periods',
    description: 'Retrieves available analytics periods for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available analytics periods',
    type: 'object',
    schema: {
      properties: {
        periods: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              year: { type: 'number' },
              month: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found or unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'gRPC service error' })
  public async getPeriods(
    @CurrentUser() user: AnalyticsProto.User,
  ): Promise<readonly AnalyticsProto.Period[]> {
    if (!user.id) {
      throw new NotFoundException('User not found or unauthorized');
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

      const response = await this.grpcClient.call(
        this.analyticsService.getPeriods(request),
        'Analytics.getPeriods',
      );
      return Object.freeze(response.periods);
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Retrieves statistical values for dashboard cards for a specific period
   * @param month - Month number (1-12)
   * @param year - Year (YYYY)
   * @param user - Current authenticated user
   * @returns Promise<AnalyticsProto.StatCardsResponse>
   */
  @Get('stat-cards-values')
  @CacheTTL(60000) // 1 minute cache
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
    minimum: 1,
    maximum: 12,
  })
  @ApiQuery({
    name: 'year',
    type: Number,
    required: true,
    description: 'Year (YYYY)',
    minimum: 2000,
  })
  @ApiResponse({
    status: 200,
    description: 'Statistical card values',
    type: 'object',
    schema: {
      properties: {
        workflowExecutions: { type: 'number' },
        creditsConsumed: { type: 'number' },
        phasesExecuted: { type: 'number' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Invalid parameters or unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'gRPC service error' })
  public async getStatCardsValues(
    @Query('month', new ParseIntPipe()) month: number,
    @Query('year', new ParseIntPipe()) year: number,
    @CurrentUser() user: AnalyticsProto.User,
  ): Promise<Readonly<AnalyticsProto.StatCardsResponse>> {
    if (!user.id || month < 1 || month > 12 || year < 2000) {
      throw new NotFoundException('Invalid parameters or unauthorized');
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

      const response = await this.grpcClient.call(
        this.analyticsService.getStatCardsValues(request),
        'Analytics.getStatCardsValues',
      );
      return Object.freeze(response);
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
  public async getWorkflowExecutionStats(
    @Query('month', new ParseIntPipe()) month: number,
    @Query('year', new ParseIntPipe()) year: number,
    @CurrentUser() user: AnalyticsProto.User,
  ): Promise<AnalyticsProto.WorkflowStatsResponse['stats']> {
    if (typeof user === 'undefined') {
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

      const response = await this.grpcClient.call(
        this.analyticsService.getWorkflowExecutionStats(request),
        'Analytics.getWorkflowExecutionStats',
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
  public async getUsedCreditsInPeriod(
    @Query('month', new ParseIntPipe()) month: number,
    @Query('year', new ParseIntPipe()) year: number,
    @CurrentUser() user: AnalyticsProto.User,
  ): Promise<AnalyticsProto.UsedCreditsResponse['stats']> {
    if (typeof user === 'undefined') {
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

      const response = await this.grpcClient.call(
        this.analyticsService.getUsedCreditsInPeriod(request),
        'Analytics.getUsedCreditsInPeriod',
      );

      return response.stats;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Retrieves dashboard statistics for the current user
   * @param user - Current authenticated user
   * @returns Promise<AnalyticsProto.DashboardStatsResponse>
   */
  @Get('dashboard-stat-cards-values')
  @CacheTTL(30000) // 30 seconds cache
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Retrieves statistical values for the main dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics',
    type: 'object',
    schema: {
      properties: {
        currentActiveProjects: { type: 'number' },
        numberOfCreatedComponents: { type: 'number' },
        favoritesComponents: { type: 'number' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found or unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'gRPC service error' })
  public async getDashboardStatCardsValues(
    @CurrentUser() user: AnalyticsProto.User,
  ): Promise<Readonly<AnalyticsProto.DashboardStatsResponse>> {
    if (!user.id) {
      throw new NotFoundException('User not found or unauthorized');
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

      const response = await this.grpcClient.call(
        this.analyticsService.getDashboardStatCardsValues(request),
        'Analytics.getDashboardStatCardsValues',
      );
      return Object.freeze(response);
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
  public async getFavoritedTableContent(
    @CurrentUser() user: AnalyticsProto.User,
  ): Promise<AnalyticsProto.FavoritedContentResponse['components']> {
    if (typeof user === 'undefined') {
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

      const response = await this.grpcClient.call(
        this.analyticsService.getFavoritedTableContent(request),
        'Analytics.getFavoritedTableContent',
      );

      return response.components;
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
