import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Period } from '@repo/types/src/analytics';
import { and, eq, gte, isNotNull, lte, min } from 'drizzle-orm';
import { periodToDateRange } from './lib/period-to-date-range';
import { inArray } from 'drizzle-orm/sql/expressions/conditions';
import { eachDayOfInterval, format } from 'date-fns';
import type { User } from '@repo/database/schemas/users';
import {
  executionPhase,
  workflowExecutions,
} from '@repo/database/schemas/workflow-executions';
import { DatabaseSchemas } from '@repo/database/schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<DatabaseSchemas>,
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

    const minYear = years.minYear
      ? new Date(years.minYear).getFullYear()
      : currentYear;

    const periods: Period[] = [];

    for (let year = minYear; year <= currentYear; year++) {
      for (let month = 1; month <= 12; month++) {
        periods.push({ year, month });
      }
    }

    return periods;
  }

  async getStatCardsValues(user: User, month: number, year: number) {
    const { startDate, endDate } = periodToDateRange({
      month,
      year,
    });

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
          inArray(workflowExecutions.status, ['COMPLETED', 'FAILED']), // TODO: PROPER ENUM VALUE
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
          eq(executionPhase.status, 'COMPLETED'), // TODO: PROPER ENUM VALUE
          isNotNull(executionPhase.creditsCost),
        ),
      );

    if (!executionsInPeriod) {
      throw new Error('No executions found in selected period');
    }

    if (!phasesInPeriod) {
      throw new Error('No phases found in selected period');
    }

    const stats = {
      workflowExecutions: executionsInPeriod.length,
      creditsConsumed: executionsInPeriod.reduce(
        (acc, execution) => acc + execution.creditsConsumed,
        0,
      ),
      phasesExecuted: phasesInPeriod.length,
    };

    return stats;
  }

  async getWorkflowExecutionStats(user: User, month: number, year: number) {
    const { startDate, endDate } = periodToDateRange({
      month,
      year,
    });

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

    if (!executionsInPeriod) {
      throw new Error('No executions found in selected period');
    }

    const dateFormat = 'yyyy-MM-dd';

    const statsDates = eachDayOfInterval({
      start: startDate,
      end: endDate,
    })
      .map((date) => format(date, dateFormat))
      .reduce(
        (acc, date) => {
          acc[date] = {
            successful: 0,
            failed: 0,
          };
          return acc;
        },
        {} as Record<
          string,
          {
            successful: number;
            failed: number;
          }
        >,
      );

    executionsInPeriod.forEach((execution) => {
      if (!execution.startedAt) {
        return;
      }
      const date = format(execution.startedAt, dateFormat);
      if (execution.status === 'COMPLETED') {
        // TODO: PROPER ENUM VALUE
        statsDates[date].successful += 1;
      } else if (execution.status === 'FAILED') {
        // TODO: PROPER ENUM VALUE
        statsDates[date].failed += 1;
      }
    });

    const results = Object.entries(statsDates).map(([date, stats]) => ({
      date,
      ...stats,
    }));

    return results;
  }

  async getUsedCreditsInPeriod(user: User, month: number, year: number) {
    const { startDate, endDate } = periodToDateRange({
      month,
      year,
    });

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
          inArray(executionPhase.status, ['COMPLETED', 'FAILED']), // TODO: PROPER ENUM VALUE
        ),
      );

    if (!executionsPhases) {
      throw new Error('No executions phases found in selected period');
    }

    const dateFormat = 'yyyy-MM-dd';

    const statsDates = eachDayOfInterval({
      start: startDate,
      end: endDate,
    })
      .map((date) => format(date, dateFormat))
      .reduce(
        (acc, date) => {
          acc[date] = {
            successful: 0,
            failed: 0,
          };
          return acc;
        },
        {} as Record<
          string,
          {
            successful: number;
            failed: number;
          }
        >,
      );

    executionsPhases.forEach((phase) => {
      if (!phase.startedAt) {
        return;
      }
      const date = format(phase.startedAt, dateFormat);
      if (phase.status === 'COMPLETED') {
        // TODO: PROPER ENUM VALUE
        statsDates[date].successful += phase.creditsCost ?? 0;
      } else if (phase.status === 'FAILED') {
        // TODO: PROPER ENUM VALUE
        statsDates[date].failed += phase.creditsCost ?? 0;
      }
    });

    const results = Object.entries(statsDates).map(([date, stats]) => ({
      date,
      ...stats,
    }));

    return results;
  }
}
