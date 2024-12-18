import { Controller, Get, Inject, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { QueryParam } from '../../../../src/analytics/get-query-param.decorator';
import { firstValueFrom } from 'rxjs';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject('ANALYTICS_SERVICE') private readonly analyticsClient: ClientProxy,
  ) {}

  @Get('periods')
  @UseGuards(JwtAuthGuard)
  async getPeriods(@CurrentUser() user: User) {
    return firstValueFrom(
      this.analyticsClient.send('analytics.periods', { userId: user.id }),
    );
  }

  @Get('stat-cards-values')
  @UseGuards(JwtAuthGuard)
  async getStatCardsValues(
    @QueryParam('month', new ParseIntPipe()) month: number,
    @QueryParam('year', new ParseIntPipe()) year: number,
    @CurrentUser() user: User,
  ) {
    return firstValueFrom(
      this.analyticsClient.send('analytics.stat-cards', {
        userId: user.id,
        month,
        year,
      }),
    );
  }

  @Get('workflow-execution-stats')
  @UseGuards(JwtAuthGuard)
  async getWorkflowExecutionStats(
    @QueryParam('month', new ParseIntPipe()) month: number,
    @QueryParam('year', new ParseIntPipe()) year: number,
    @CurrentUser() user: User,
  ) {
    return firstValueFrom(
      this.analyticsClient.send('analytics.workflow-stats', {
        userId: user.id,
        month,
        year,
      }),
    );
  }

  // ... similar pattern for other endpoints
}
