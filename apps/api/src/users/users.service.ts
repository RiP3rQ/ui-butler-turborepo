import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { CreateUserRequest } from './dto/create-user.request';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema/schema';
import { users } from './schema/schema';
import { and, eq } from 'drizzle-orm';
import { TokenPayload } from '../auth/token-payload.interface';

type ReceivedData = {
  refreshToken: string;
};

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async createUser(data: CreateUserRequest) {
    await this.database.insert(users).values({
      ...schema.users,
      password: await hash(data.password, 10),
    }); // request validation
  }

  async getUsers() {
    return await this.database.query.users.findMany({
      with: { profile: true },
    });
  }

  async getOrCreateUser(data: CreateUserRequest) {
    const user = await this.database
      .select()
      .from(users)
      .where(eq(users.email, data.email));
    if (user) {
      return user;
    }
    return this.createUser(data);
  }

  async getUser(payload: { email: string }) {
    const user = await this.database
      .select()
      .from(users)
      .where(eq(users.email, payload.email));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user[0];
  }

  async updateUser(query: TokenPayload, data: ReceivedData) {
    const user = await this.database
      .select()
      .from(users)
      .where(
        and(eq(users.id, Number(query.userId)), eq(users.email, query.email)),
      );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.database
      .update(users)
      .set({
        refreshToken: data.refreshToken,
      })
      .where(
        and(eq(users.id, Number(query.userId)), eq(users.email, query.email)),
      )
      .returning();
  }

  async createProfile(profile: typeof schema.profile.$inferInsert) {
    await this.database.insert(schema.profile).values(profile);
  }
}
