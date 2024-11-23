import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { and, eq } from 'drizzle-orm';
import { TokenPayload } from '../auth/token-payload.interface';
import { CreateProfileDto } from './dto/create-profile.dto';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DatabaseSchemas } from '../database/merged-schemas';
import { profile, User, users } from '../database/schemas/users';

type ReceivedData = {
  refreshToken: string;
};

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NeonHttpDatabase<DatabaseSchemas>,
  ) {}

  async createUser(data: CreateUserDto) {
    const newUser = await this.database
      .insert(users)
      .values({
        ...data,
        password: await hash(data.password, 10),
      })
      .returning(); // request validation
    return newUser[0];
  }

  async getUsers() {
    return await this.database.query.users.findMany({
      with: { profile: true },
    });
  }

  async getOrCreateUser(data: CreateUserDto) {
    const user = await this.database
      .select()
      .from(users)
      .where(eq(users.email, data.email));
    if (!user || user?.length > 0) {
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

    return this.database
      .update(users)
      .set({
        // @ts-ignore // TODO: FIX THIS TYPE PROBLEM
        refreshToken: data.refreshToken,
      })
      .where(
        and(eq(users.id, Number(query.userId)), eq(users.email, query.email)),
      )
      .returning();
  }

  async getCurrentUserBasic(user: User) {
    const [userBasicData] = await this.database
      .select()
      .from(users)
      .where(eq(users.id, user.id));

    if (!userBasicData) {
      return {
        username: undefined,
        email: user.email,
        avatar: undefined,
      };
    }

    return {
      username: userBasicData.username,
      email: user.email,
      avatar: 'NOT IMPLEMENTED',
    };
  }

  async createProfile(profileDto: CreateProfileDto) {
    await this.database.insert(profile).values(profileDto);
  }
}
