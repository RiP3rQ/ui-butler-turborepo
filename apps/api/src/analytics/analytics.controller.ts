import {
  Controller,
  Get,
  NotFoundException,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/types/user';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueryParam } from './get-query-param.decorator';

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

  @Get('stat-cards-values')
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
}
