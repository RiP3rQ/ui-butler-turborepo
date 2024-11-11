import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../users/types/user';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Period } from '@repo/types/analytics';
import { DatabaseSchemas } from '../database/merged-schemas';
import {
  executionPhase,
  workflowExecutions,
} from '../workflow-executions/schema';
import { and, eq, gte, isNotNull, lte, min } from 'drizzle-orm';
import { periodToDateRange } from './lib/period-to-date-range';
import { inArray } from 'drizzle-orm/sql/expressions/conditions';

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
}
