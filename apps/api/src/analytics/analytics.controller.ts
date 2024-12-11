import {
  Controller,
  Get,
  NotFoundException,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueryParam } from './get-query-param.decorator';
import type { User } from '../database/schemas/users';
import { LogErrors } from '../common/error-handling/log-errors.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('periods')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getPeriods(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    return this.analyticsService.getPeriods(user);
  }

  @Get('stat-cards-values')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getStatCardsValues(
    @QueryParam('month', new ParseIntPipe()) month: number,
    @QueryParam('year', new ParseIntPipe()) year: number,
    @CurrentUser() user: User,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!month || !year) {
      throw new NotFoundException('Invalid query parameters provided');
    }

    return this.analyticsService.getStatCardsValues(user, month, year);
  }

  @Get('workflow-execution-stats')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getWorkflowExecutionStats(
    @QueryParam('month', new ParseIntPipe()) month: number,
    @QueryParam('year', new ParseIntPipe()) year: number,
    @CurrentUser() user: User,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!month || !year) {
      throw new NotFoundException('Invalid query parameters provided');
    }

    return this.analyticsService.getWorkflowExecutionStats(user, month, year);
  }

  @Get('used-credits-in-period')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getUsedCreditsInPeriod(
    @QueryParam('month', new ParseIntPipe()) month: number,
    @QueryParam('year', new ParseIntPipe()) year: number,
    @CurrentUser() user: User,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!month || !year) {
      throw new NotFoundException('Invalid query parameters provided');
    }

    return this.analyticsService.getUsedCreditsInPeriod(user, month, year);
  }

  @Get('dashboard-stat-cards-values')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getDashboardStatCardsValues(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.analyticsService.getDashboardStatCardsValues(user);
  }

  @Get('favorited-table-content')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getFavoritedTableContent(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.analyticsService.getFavoritedTableContent(user);
  }
}
