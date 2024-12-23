import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import {
  and,
  eq,
  type NeonDatabaseType,
  profile,
  User,
  users,
} from '@app/database';
import { UsersProto } from '@app/proto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly database: NeonDatabaseType,
  ) {}

  async createUser(data: UsersProto.CreateUserDto) {
    const newUserData = {
      email: data.email,
      password: await hash(data.password, 10),
      username: data.username,
    } as User;

    const newUser = await this.database
      .insert(users)
      .values(newUserData)
      .returning();
    return newUser[0];
  }

  async getUsers() {
    return this.database.query.users.findMany({
      with: { profile: true },
    });
  }

  async getOrCreateUser(data: UsersProto.CreateUserDto) {
    const user = await this.database
      .select()
      .from(users)
      .where(eq(users.email, data.email));
    if (!user || user?.length > 0) {
      return user[0];
    }
    return this.createUser(data);
  }

  async getUser(payload: { email: string }) {
    const user = await this.database
      .select()
      .from(users)
      .where(eq(users.email, payload.email));

    if (!user || user.length === 0) {
      throw new NotFoundException('User not found');
    }

    return user[0];
  }

  async updateUser(
    query: UsersProto.TokenPayload,
    data: UsersProto.ReceivedRefreshToken,
  ) {
    const user = await this.database
      .select()
      .from(users)
      .where(
        and(eq(users.id, Number(query.userId)), eq(users.email, query.email)),
      );

    if (!user || user.length === 0) {
      throw new NotFoundException('User not found');
    }

    const refreshTokenData = {
      refreshToken: data.refreshToken,
    } as Partial<User>;

    return this.database
      .update(users)
      .set(refreshTokenData)
      .where(
        and(eq(users.id, Number(query.userId)), eq(users.email, query.email)),
      )
      .returning();
  }

  async getCurrentUserBasic(user: UsersProto.User) {
    const [userBasicData] = await this.database
      .select()
      .from(users)
      .where(eq(users.id, user.id));

    if (!userBasicData) {
      return {
        id: user.id,
        username: undefined,
        email: user.email,
        avatar: undefined,
      };
    }

    return {
      id: user.id,
      username: userBasicData.username,
      email: user.email,
      avatar: 'NOT IMPLEMENTED',
    };
  }

  async createProfile(
    profileDto: UsersProto.CreateProfileDto,
  ): Promise<UsersProto.Profile> {
    return this.database.insert(profile).values(profileDto).returning()[0];
  }
}
