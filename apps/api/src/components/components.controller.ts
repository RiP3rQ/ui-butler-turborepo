import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ComponentsService } from './components.service';
import { LogErrors } from '../common/error-handling/log-errors.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { User } from '../database/schemas/users';
import { SaveComponentDto } from './dto/save-component.dto';
import { FavoriteComponentDto } from './dto/favorite-component.dto';

@Controller('components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Get('/:projectId/:componentId')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getComponent(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Param('componentId') componentId: string,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    if (!projectId || !componentId) {
      throw new BadRequestException('Invalid project or component ID');
    }

    return this.componentsService.getSingleComponent(
      user,
      Number(projectId),
      Number(componentId),
    );
  }

  @Post()
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  saveComponent(
    @CurrentUser() user: User,
    @Body() saveComponentDto: SaveComponentDto,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.componentsService.saveComponent(user, saveComponentDto);
  }

  @Post('/favorite')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  favoriteComponent(
    @CurrentUser() user: User,
    @Body() favoriteComponentDto: FavoriteComponentDto,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    return this.componentsService.favoriteComponent(user, favoriteComponentDto);
  }
}
