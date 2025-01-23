// analytics.service.ts
import { status } from '@grpc/grpc-js';
import { dateToTimestamp } from '@microservices/common';
import {
  and,
  components,
  DATABASE_CONNECTION,
  eq,
  executionPhase,
  gte,
  inArray,
  lte,
  min,
  type NeonDatabaseType,
  projects,
  sql,
  workflowExecutions,
} from '@microservices/database';
import { AnalyticsProto } from '@microservices/proto';
import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { eachDayOfInterval, format } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NeonDatabaseType,
  ) {}

  public async getPeriods(
    user: AnalyticsProto.User,
  ): Promise<AnalyticsProto.Period[]> {
    try {
      const [yearsData] = await this.database
        .select({ minYear: min(workflowExecutions.startedAt) })
        .from(workflowExecutions)
        .where(eq(workflowExecutions.userId, user.id));

      if (!yearsData) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'No periods found',
        });
      }

      const years = yearsData;
      const currentYear = new Date().getFullYear();
      const minYear = years.minYear
        ? new Date(years.minYear).getFullYear()
        : currentYear;

      const periods: AnalyticsProto.Period[] = [];
      for (let year = minYear; year <= currentYear; year++) {
        for (let month = 1; month <= 12; month++) {
          periods.push({
            $type: 'api.analytics.Period',
            year,
            month,
          });
        }
      }

      return periods;
    } catch (error) {
      console.error('Error in getPeriods:', error);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async getStatCardsValues(
    user: AnalyticsProto.User,
    month: number,
    year: number,
  ): Promise<AnalyticsProto.StatCardsResponse> {
    try {
      const { startDate, endDate } = this.periodToDateRange({ month, year });

      const executionsInPeriod = await this.database
        .select({
          creditsConsumed: workflowExecutions.creditsConsumed,
        })
        .from(workflowExecutions)
        .where(
          and(
            eq(workflowExecutions.userId, user.id),
            gte(workflowExecutions.startedAt, startDate),
            lte(workflowExecutions.startedAt, endDate),
          ),
        );

      const phasesInPeriod = await this.database
        .select({
          creditsCost: executionPhase.creditsCost,
        })
        .from(executionPhase)
        .where(
          and(
            eq(executionPhase.userId, user.id),
            gte(executionPhase.startedAt, startDate),
            lte(executionPhase.startedAt, endDate),
          ),
        );

      return {
        $type: 'api.analytics.StatCardsResponse',
        workflowExecutions: executionsInPeriod.length,
        creditsConsumed: executionsInPeriod.reduce(
          (acc, execution) => acc + (execution.creditsConsumed ?? 0),
          0,
        ),
        phasesExecuted: phasesInPeriod.length,
      };
    } catch (error) {
      console.error('Error in getStatCardsValues:', error);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async getWorkflowExecutionStats(
    user: AnalyticsProto.User,
    month: number,
    year: number,
  ): Promise<AnalyticsProto.DailyStats[]> {
    try {
      const { startDate, endDate } = this.periodToDateRange({ month, year });

      const executionsInPeriod = await this.database
        .select({
          status: workflowExecutions.status,
          startedAt: workflowExecutions.startedAt,
        })
        .from(workflowExecutions)
        .where(
          and(
            eq(workflowExecutions.userId, user.id),
            gte(workflowExecutions.startedAt, startDate),
            lte(workflowExecutions.startedAt, endDate),
          ),
        );

      const dateFormat = 'yyyy-MM-dd';
      const statsDates = this.initializeDateStats(
        startDate,
        endDate,
        dateFormat,
      );

      executionsInPeriod.forEach((execution) => {
        if (!execution.startedAt) return;

        const date = format(execution.startedAt, dateFormat);
        const stats = statsDates[date];
        if (!stats) return;

        if (execution.status === 'COMPLETED') {
          stats.successful++;
        } else if (execution.status === 'FAILED') {
          stats.failed++;
        }
      });

      return Object.entries(statsDates).map(([date, stats]) => ({
        $type: 'api.analytics.DailyStats',
        date: dateToTimestamp(date),
        ...stats,
      }));
    } catch (error) {
      console.error('Error in getWorkflowExecutionStats:', error);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async getUsedCreditsInPeriod(
    user: AnalyticsProto.User,
    month: number,
    year: number,
  ): Promise<AnalyticsProto.DailyStats[]> {
    try {
      const { startDate, endDate } = this.periodToDateRange({ month, year });

      const executionsPhases = await this.database
        .select({
          status: executionPhase.status,
          startedAt: executionPhase.startedAt,
          creditsCost: executionPhase.creditsCost,
        })
        .from(executionPhase)
        .where(
          and(
            eq(executionPhase.userId, user.id),
            gte(executionPhase.startedAt, startDate),
            lte(executionPhase.startedAt, endDate),
            inArray(executionPhase.status, ['COMPLETED', 'FAILED']),
          ),
        );

      const dateFormat = 'yyyy-MM-dd';
      const statsDates = this.initializeDateStats(
        startDate,
        endDate,
        dateFormat,
      );

      executionsPhases.forEach((phase) => {
        if (!phase.startedAt) return;

        try {
          const date = format(new Date(phase.startedAt), dateFormat);
          const stats = statsDates[date];
          if (!stats) return;

          if (phase.status === 'COMPLETED') {
            stats.successful += phase.creditsCost ?? 0;
          } else if (phase.status === 'FAILED') {
            stats.failed += phase.creditsCost ?? 0;
          }
        } catch (error) {
          console.error('Invalid date format:', phase.startedAt);
        }
      });

      return Object.entries(statsDates).map(([date, stats]) => ({
        $type: 'api.analytics.DailyStats',
        date: dateToTimestamp(date),
        ...stats,
      }));
    } catch (error) {
      console.error('Error in getUsedCreditsInPeriod:', error);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async getDashboardStatCardsValues(
    user: AnalyticsProto.User,
  ): Promise<AnalyticsProto.DashboardStatsResponse> {
    try {
      const data = await this.database
        .select({
          currentActiveProjects: sql<number>`count(distinct
          ${projects.id}
          )`,
          numberOfCreatedComponents: sql<number>`count(
          ${components.id}
          )`,
          favoritesComponents: sql<number>`count(case when
          ${components.isFavorite}
          =
          true
          then
          1
          end
          )`,
        })
        .from(projects)
        .leftJoin(components, eq(projects.id, components.projectId))
        .where(eq(projects.userId, user.id));

      return {
        $type: 'api.analytics.DashboardStatsResponse',
        currentActiveProjects: data[0]?.currentActiveProjects ?? 0,
        numberOfCreatedComponents: data[0]?.numberOfCreatedComponents ?? 0,
        favoritesComponents: data[0]?.favoritesComponents ?? 0,
      };
    } catch (error) {
      console.error('Error in getDashboardStatCardsValues:', error);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async getFavoritedTableContent(
    user: AnalyticsProto.User,
  ): Promise<AnalyticsProto.FavoritedComponent[]> {
    try {
      const favoritedComponents = await this.database
        .select({
          id: components.id,
          name: components.title,
          projectName: projects.title,
          createdAt: components.createdAt,
          updatedAt: components.updatedAt,
        })
        .from(components)
        .leftJoin(projects, eq(components.projectId, projects.id))
        .where(
          and(eq(components.userId, user.id), eq(components.isFavorite, true)),
        );

      return favoritedComponents.map((component) => ({
        $type: 'api.analytics.FavoritedComponent',
        id: component.id,
        name: component.name,
        projectName: component.projectName ?? 'Untitled Project',
        createdAt: dateToTimestamp(component.createdAt.toISOString()),
        updatedAt: dateToTimestamp(component.updatedAt.toISOString()),
      }));
    } catch (error) {
      console.error('Error in getFavoritedTableContent:', error);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  private periodToDateRange(period: { month: number; year: number }): {
    startDate: Date;
    endDate: Date;
  } {
    const startDate = new Date(period.year, period.month - 1, 1);
    const endDate = new Date(period.year, period.month, 0);
    return { startDate, endDate };
  }

  private initializeDateStats(
    startDate: Date,
    endDate: Date,
    dateFormat: string,
  ): Record<string, { successful: number; failed: number }> {
    return eachDayOfInterval({ start: startDate, end: endDate })
      .map((date) => format(date, dateFormat))
      .reduce<Record<string, { successful: number; failed: number }>>(
        (acc, date) => {
          acc[date] = { successful: 0, failed: 0 };
          return acc;
        },
        {},
      );
  }
}
