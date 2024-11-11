import {
  Controller,
  Get,
  NotFoundException,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Response } from 'express';
import { User } from '../users/types/user';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('periods')
  @UseGuards(LocalAuthGuard)
  getPeriods(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log('user', user);
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    return this.analyticsService.getPeriods(user, response);
  }
}
