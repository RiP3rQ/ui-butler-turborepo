import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ComponentsService } from './components.service';
import { LogErrors } from '../common/error-handling/log-errors.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { User } from '../database/schemas/users';
import { CreateComponentDto } from './dto/create-new-component.dto';

@Controller('components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Post()
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  createComponent(
    @CurrentUser() user: User,
    @Body() createComponentDto: CreateComponentDto,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.componentsService.createComponent(user, createComponentDto);
  }
}
