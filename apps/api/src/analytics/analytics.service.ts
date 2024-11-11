import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../users/types/user';
import { Response } from 'express';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Period } from '@repo/types/analytics';
import { DatabaseSchemas } from '../database/merged-schemas';
import { workflowExecutions } from '../workflow-executions/schema';
import { eq, min } from 'drizzle-orm';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<DatabaseSchemas>,
  ) {}

  async getPeriods(user: User, response: Response) {
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
}
