import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/types/user';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('periods')
  @UseGuards(JwtAuthGuard)
  getPeriods(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    return this.analyticsService.getPeriods(user);
  }
}
