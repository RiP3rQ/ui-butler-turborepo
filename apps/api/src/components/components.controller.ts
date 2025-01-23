import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ComponentsService } from './components.service';
import { LogErrors } from '../common/error-handling/log-errors.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { User } from '../database/schemas/users';
import { SaveComponentDto } from './dto/save-component.dto';
import { FavoriteComponentDto } from './dto/favorite-component.dto';
import { GenerateComponentRequestDto } from './dto/component-generate-message.dto';
import type { Response } from 'express';
import { type CodeType, codeTypeValues } from '@shared/types';
import { UpdateComponentCodeDto } from './dto/update-component.dto';
import { GenerateCodeDto } from './dto/generate-code.dto';

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

  @Post('/generate')
  @UseGuards(JwtAuthGuard)
  async generateComponent(
    @CurrentUser() user: User,
    @Body() body: GenerateComponentRequestDto,
    @Res() res: Response,
  ) {
    try {
      if (!user) {
        throw new NotFoundException('Unauthorized');
      }

      const lastMessage = body.messages[body.messages.length - 1];

      if (!lastMessage || !lastMessage.content) {
        throw new Error('No message content provided');
      }

      await this.componentsService.generateComponentStream(
        lastMessage.content,
        res,
      );
    } catch (error) {
      console.error('Error generating component:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : JSON.stringify(error),
      });
    }
  }

  @Patch('/:componentId/:codeType')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  updateComponentCode(
    @CurrentUser() user: User,
    @Param('componentId', ParseIntPipe) componentId: number,
    @Param('codeType', new ParseEnumPipe(codeTypeValues)) codeType: CodeType,
    @Body() updateComponentCodeDto: UpdateComponentCodeDto,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    return this.componentsService.updateComponentCode(
      user,
      Number(componentId),
      codeType,
      updateComponentCodeDto,
    );
  }

  @Post('/generate-code')
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  generateCodeBasedOnType(
    @CurrentUser() user: User,
    @Body() body: GenerateCodeDto,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }

    return this.componentsService.generateCodeFunction(user, body);
  }
}
