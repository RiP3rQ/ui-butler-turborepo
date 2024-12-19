import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eachDayOfInterval, format } from 'date-fns';
import { User } from '@app/common';
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
} from '@app/database';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NeonDatabaseType,
  ) {}

  async getPeriods(user: User) {
    const yearsData = await this.database
      .select({ minYear: min(workflowExecutions.startedAt) })
      .from(workflowExecutions)
      .where(eq(workflowExecutions.userId, user.id));

    if (!yearsData) {
      throw new NotFoundException('No periods found');
    }

    const years = yearsData[0];
    const currentYear = new Date().getFullYear();
    const minYear = years?.minYear
      ? new Date(years.minYear).getFullYear()
      : currentYear;

    const periods = [];
    for (let year = minYear; year <= currentYear; year++) {
      for (let month = 1; month <= 12; month++) {
        periods.push({ year, month });
      }
    }

    return periods;
  }

  async getStatCardsValues(user: User, month: number, year: number) {
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
      workflowExecutions: executionsInPeriod.length,
      creditsConsumed: executionsInPeriod.reduce(
        (acc, execution) => acc + (execution.creditsConsumed ?? 0),
        0,
      ),
      phasesExecuted: phasesInPeriod.length,
    };
  }

  async getWorkflowExecutionStats(user: User, month: number, year: number) {
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
    const statsDates = this.initializeDateStats(startDate, endDate, dateFormat);

    executionsInPeriod.forEach((execution) => {
      if (!execution.startedAt) return;

      const date = format(execution.startedAt, dateFormat);
      if (execution.status === 'COMPLETED') {
        statsDates[date].successful++;
      } else if (execution.status === 'FAILED') {
        statsDates[date].failed++;
      }
    });

    return Object.entries(statsDates).map(([date, stats]) => ({
      date,
      ...stats,
    }));
  }

  async getUsedCreditsInPeriod(user: User, month: number, year: number) {
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
    const statsDates = this.initializeDateStats(startDate, endDate, dateFormat);

    executionsPhases.forEach((phase) => {
      if (!phase.startedAt) return;

      const date = format(phase.startedAt, dateFormat);
      if (phase.status === 'COMPLETED') {
        statsDates[date].successful += phase.creditsCost ?? 0;
      } else if (phase.status === 'FAILED') {
        statsDates[date].failed += phase.creditsCost ?? 0;
      }
    });

    return Object.entries(statsDates).map(([date, stats]) => ({
      date,
      ...stats,
    }));
  }

  async getDashboardStatCardsValues(user: User) {
    const [data] = await this.database
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
      currentActiveProjects: data.currentActiveProjects ?? 0,
      numberOfCreatedComponents: data.numberOfCreatedComponents ?? 0,
      favoritesComponents: data.favoritesComponents ?? 0,
    };
  }

  async getFavoritedTableContent(user: User) {
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
      id: component.id,
      name: component.name,
      projectName: component.projectName,
      createdAt: new Date(component.createdAt).toISOString(),
      updatedAt: new Date(component.updatedAt).toISOString(),
    }));
  }

  private periodToDateRange(period: { month: number; year: number }) {
    const startDate = new Date(period.year, period.month - 1, 1);
    const endDate = new Date(period.year, period.month, 0);
    return { startDate, endDate };
  }

  private initializeDateStats(
    startDate: Date,
    endDate: Date,
    dateFormat: string,
  ) {
    return eachDayOfInterval({ start: startDate, end: endDate })
      .map((date) => format(date, dateFormat))
      .reduce(
        (acc, date) => {
          acc[date] = { successful: 0, failed: 0 };
          return acc;
        },
        {} as Record<string, { successful: number; failed: number }>,
      );
  }
}
