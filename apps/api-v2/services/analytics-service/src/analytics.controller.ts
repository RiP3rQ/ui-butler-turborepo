import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AnalyticsService } from './analytics.service';
import { CurrentUser, JwtAuthGuard, User } from '@app/common';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @MessagePattern('analytics.periods')
  @UseGuards(JwtAuthGuard)
  async getPeriods(@CurrentUser() user: User) {
    return this.analyticsService.getPeriods(user);
  }

  @MessagePattern('analytics.stat-cards')
  @UseGuards(JwtAuthGuard)
  async getStatCardsValues(
    @Payload() data: { month: number; year: number },
    @CurrentUser() user: User,
  ) {
    return this.analyticsService.getStatCardsValues(
      user,
      data.month,
      data.year,
    );
  }

  @MessagePattern('analytics.workflow-stats')
  @UseGuards(JwtAuthGuard)
  async getWorkflowExecutionStats(
    @Payload() data: { month: number; year: number },
    @CurrentUser() user: User,
  ) {
    return this.analyticsService.getWorkflowExecutionStats(
      user,
      data.month,
      data.year,
    );
  }

  @MessagePattern('analytics.used-credits')
  @UseGuards(JwtAuthGuard)
  async getUsedCreditsInPeriod(
    @Payload() data: { month: number; year: number },
    @CurrentUser() user: User,
  ) {
    return this.analyticsService.getUsedCreditsInPeriod(
      user,
      data.month,
      data.year,
    );
  }

  @MessagePattern('analytics.dashboard-stats')
  @UseGuards(JwtAuthGuard)
  async getDashboardStatCardsValues(@CurrentUser() user: User) {
    return this.analyticsService.getDashboardStatCardsValues(user);
  }

  @MessagePattern('analytics.favorited')
  @UseGuards(JwtAuthGuard)
  async getFavoritedTableContent(@CurrentUser() user: User) {
    return this.analyticsService.getFavoritedTableContent(user);
  }
}
