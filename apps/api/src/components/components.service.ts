import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import type { DrizzleDatabase } from '../database/merged-schemas';
import { User } from '../database/schemas/users';
import { CreateComponentDto } from './dto/create-new-component.dto';
import { components, NewComponent } from '../database/schemas/components';

@Injectable()
export class ComponentsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  // POST /components
  async createComponent(user: User, createComponentDto: CreateComponentDto) {
    const newComponentData = {
      title: createComponentDto.title,
      userId: user.id,
      code: createComponentDto.code,
      projectId: Number(createComponentDto.projectId),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as NewComponent;

    const [newComponent] = await this.database
      .insert(components)
      .values(newComponentData)
      .returning();

    if (!newComponent) {
      throw new NotFoundException('Component not created');
    }

    return newComponent;
  }
}
