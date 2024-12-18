import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AnalyticsService } from './analytics.service';
import { User } from '@app/common';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @MessagePattern('analytics.periods')
  async getPeriods(@Payload() data: { user: User }) {
    return this.analyticsService.getPeriods(data.user);
  }

  @MessagePattern('analytics.stat-cards')
  async getStatCardsValues(
    @Payload() data: { user: User; month: number; year: number },
  ) {
    return this.analyticsService.getStatCardsValues(
      data.user,
      data.month,
      data.year,
    );
  }

  @MessagePattern('analytics.workflow-stats')
  async getWorkflowExecutionStats(
    @Payload() data: { user: User; month: number; year: number },
  ) {
    return this.analyticsService.getWorkflowExecutionStats(
      data.user,
      data.month,
      data.year,
    );
  }

  @MessagePattern('analytics.used-credits')
  async getUsedCreditsInPeriod(
    @Payload() data: { user: User; month: number; year: number },
  ) {
    return this.analyticsService.getUsedCreditsInPeriod(
      data.user,
      data.month,
      data.year,
    );
  }

  @MessagePattern('analytics.dashboard-stats')
  async getDashboardStatCardsValues(@Payload() data: { user: User }) {
    return this.analyticsService.getDashboardStatCardsValues(data.user);
  }

  @MessagePattern('analytics.favorited')
  async getFavoritedTableContent(@Payload() data: { user: User }) {
    return this.analyticsService.getFavoritedTableContent(data.user);
  }
}
