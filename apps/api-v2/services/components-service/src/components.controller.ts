import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ComponentsService } from './components.service';
import {
  FavoriteComponentDto,
  GenerateCodeDto,
  GenerateComponentRequestDto,
  SaveComponentDto,
  UpdateComponentCodeDto,
  User,
} from '@app/common';
import { CodeType } from '@repo/types';
import { type Response } from 'express';

@Controller()
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @MessagePattern('components.get')
  async getComponent(
    @Payload() data: { user: User; projectId: number; componentId: number },
  ) {
    return this.componentsService.getSingleComponent(
      data.user,
      data.projectId,
      data.componentId,
    );
  }

  @MessagePattern('components.save')
  async saveComponent(
    @Payload() data: { user: User; saveComponentDto: SaveComponentDto },
  ) {
    return this.componentsService.saveComponent(
      data.user,
      data.saveComponentDto,
    );
  }

  @MessagePattern('components.favorite')
  async favoriteComponent(
    @Payload() data: { user: User; favoriteComponentDto: FavoriteComponentDto },
  ) {
    return this.componentsService.favoriteComponent(
      data.user,
      data.favoriteComponentDto,
    );
  }

  @Post('api/components/generate')
  async generateComponent(
    @Req() req: Request,
    @Body() body: GenerateComponentRequestDto,
    @Res() res: Response,
  ) {
    try {
      const prompt = body.messages[body.messages.length - 1].content;
      return this.componentsService.generateComponentStream(prompt, res);
    } catch (error) {
      console.error('Error in Components Service:', error);
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      res.status(500).json({ error: errorMessage });
    }
  }

  @MessagePattern('components.update-code')
  async updateComponentCode(
    @Payload()
    data: {
      user: User;
      componentId: number;
      codeType: CodeType;
      updateComponentCodeDto: UpdateComponentCodeDto;
    },
  ) {
    return this.componentsService.updateComponentCode(
      data.user,
      data.componentId,
      data.codeType,
      data.updateComponentCodeDto,
    );
  }

  @MessagePattern('components.generate-code')
  async generateCodeBasedOnType(
    @Payload() data: { user: User; generateCodeDto: GenerateCodeDto },
  ) {
    return this.componentsService.generateCodeFunction(
      data.user,
      data.generateCodeDto,
    );
  }
}
