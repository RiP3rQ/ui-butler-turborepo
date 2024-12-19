import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CurrentUser,
  FavoriteComponentDto,
  GenerateCodeDto,
  GenerateComponentRequestDto,
  JwtAuthGuard,
  SaveComponentDto,
  UpdateComponentCodeDto,
  type User,
} from '@app/common';
import { type Response } from 'express';
import { type CodeType, codeTypeValues } from '@repo/types';

@Controller('components')
@UseGuards(JwtAuthGuard)
export class ComponentsController {
  constructor(
    @Inject('COMPONENTS_SERVICE')
    private readonly componentsClient: ClientProxy,
  ) {}

  @Get('/:projectId/:componentId')
  async getComponent(
    @CurrentUser() user: User,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('componentId', ParseIntPipe) componentId: number,
  ) {
    return firstValueFrom(
      this.componentsClient.send('components.get', {
        user,
        projectId,
        componentId,
      }),
    );
  }

  @Post()
  async saveComponent(
    @CurrentUser() user: User,
    @Body() saveComponentDto: SaveComponentDto,
  ) {
    return firstValueFrom(
      this.componentsClient.send('components.save', { user, saveComponentDto }),
    );
  }

  @Post('/favorite')
  async favoriteComponent(
    @CurrentUser() user: User,
    @Body() favoriteComponentDto: FavoriteComponentDto,
  ) {
    return firstValueFrom(
      this.componentsClient.send('components.favorite', {
        user,
        favoriteComponentDto,
      }),
    );
  }

  @Post('/generate')
  async generateComponent(
    @CurrentUser() user: User,
    @Body() body: GenerateComponentRequestDto,
    @Res() res: Response,
  ) {
    return firstValueFrom(
      this.componentsClient.send('components.generate', {
        prompt: body.messages[body.messages.length - 1].content,
        response: res,
      }),
    );
  }

  @Patch('/:componentId/:codeType')
  async updateComponentCode(
    @CurrentUser() user: User,
    @Param('componentId', ParseIntPipe) componentId: number,
    @Param('codeType', new ParseEnumPipe(codeTypeValues)) codeType: CodeType,
    @Body() updateComponentCodeDto: UpdateComponentCodeDto,
  ) {
    return firstValueFrom(
      this.componentsClient.send('components.update-code', {
        user,
        componentId,
        codeType,
        updateComponentCodeDto,
      }),
    );
  }

  @Post('/generate-code')
  async generateCodeBasedOnType(
    @CurrentUser() user: User,
    @Body() generateCodeDto: GenerateCodeDto,
  ) {
    return firstValueFrom(
      this.componentsClient.send('components.generate-code', {
        user,
        generateCodeDto,
      }),
    );
  }
}
