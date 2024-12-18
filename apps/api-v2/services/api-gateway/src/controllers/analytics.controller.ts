import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CurrentUser, JwtAuthGuard, type User } from '@app/common';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject('ANALYTICS_SERVICE') private readonly analyticsClient: ClientProxy,
  ) {}

  @Get('periods')
  @UseGuards(JwtAuthGuard)
  async getPeriods(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    return firstValueFrom(
      this.analyticsClient.send('analytics.periods', { user }),
    );
  }

  @Get('stat-cards-values')
  @UseGuards(JwtAuthGuard)
  async getStatCardsValues(
    @Query('month', new ParseIntPipe()) month: number,
    @Query('year', new ParseIntPipe()) year: number,
    @CurrentUser() user: User,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!month || !year) {
      throw new NotFoundException('Invalid query parameters provided');
    }

    return firstValueFrom(
      this.analyticsClient.send('analytics.stat-cards', { user, month, year }),
    );
  }

  @Get('workflow-execution-stats')
  @UseGuards(JwtAuthGuard)
  async getWorkflowExecutionStats(
    @Query('month', new ParseIntPipe()) month: number,
    @Query('year', new ParseIntPipe()) year: number,
    @CurrentUser() user: User,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!month || !year) {
      throw new NotFoundException('Invalid query parameters provided');
    }

    return firstValueFrom(
      this.analyticsClient.send('analytics.workflow-stats', {
        user,
        month,
        year,
      }),
    );
  }

  @Get('used-credits-in-period')
  @UseGuards(JwtAuthGuard)
  async getUsedCreditsInPeriod(
    @Query('month', new ParseIntPipe()) month: number,
    @Query('year', new ParseIntPipe()) year: number,
    @CurrentUser() user: User,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!month || !year) {
      throw new NotFoundException('Invalid query parameters provided');
    }

    return firstValueFrom(
      this.analyticsClient.send('analytics.used-credits', {
        user,
        month,
        year,
      }),
    );
  }

  @Get('dashboard-stat-cards-values')
  @UseGuards(JwtAuthGuard)
  async getDashboardStatCardsValues(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return firstValueFrom(
      this.analyticsClient.send('analytics.dashboard-stats', { user }),
    );
  }

  @Get('favorited-table-content')
  @UseGuards(JwtAuthGuard)
  async getFavoritedTableContent(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return firstValueFrom(
      this.analyticsClient.send('analytics.favorited', { user }),
    );
  }
}
