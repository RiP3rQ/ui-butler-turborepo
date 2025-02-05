import { status } from '@grpc/grpc-js';
import {
  and,
  eq,
  type NeonDatabaseType,
  profile,
  User,
  users,
} from '@microservices/database';
import { UsersProto } from '@microservices/proto';
import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { hash } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly database: NeonDatabaseType,
  ) {}

  public async createUser(
    data: UsersProto.CreateUserDto,
  ): Promise<UsersProto.User> {
    try {
      const newUserData = {
        email: data.email,
        password: await hash(data.password, 10),
        username: data.username,
      } as User;

      const [newUser] = await this.database
        .insert(users)
        .values(newUserData)
        .returning();

      if (!newUser) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Failed to create a new user',
        });
      }

      return {
        $type: 'api.users.User',
        ...newUser,
        username: newUser.username ?? 'UNKNOWN_USERNAME',
        email: newUser.email ?? 'UNKNOWN_EMAIL',
        refreshToken: newUser.refreshToken ?? 'UNKOWN_REFRESH_TOKEN',
      };
    } catch (error) {
      console.error('[ERROR] Error in createUser function:', error);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async getUsers(): Promise<UsersProto.GetUsersResponse> {
    try {
      const usersData = await this.database.query.users.findMany({
        with: { profile: true },
      });

      const mappedUsers = usersData.map((user) => {
        return {
          $type: 'api.users.User',
          id: user.id,
          email: user.email ?? 'UNKNOWN_EMAIL',
          username: user.username ?? 'UNKNOWN_USERNAME',
        } satisfies UsersProto.User;
      });

      return {
        $type: 'api.users.GetUsersResponse',
        users: mappedUsers,
      };
    } catch (error) {
      console.error('[ERROR] Error in getUsers function:', error);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async getOrCreateUser(
    data: UsersProto.CreateUserDto,
  ): Promise<UsersProto.User> {
    try {
      const [user] = await this.database
        .select()
        .from(users)
        .where(eq(users.email, data.email));
      if (!user) {
        console.warn('[WARN] User not found, creating new user');
        return this.createUser(data);
      }
      return {
        $type: 'api.users.User',
        ...user,
        username: user.username ?? 'UNKNOWN_USERNAME',
        email: user.email ?? 'UNKNOWN_EMAIL',
        refreshToken: user.refreshToken ?? 'UNKOWN_REFRESH_TOKEN',
      } satisfies UsersProto.User;
    } catch (error) {
      console.error('[ERROR] Error in getOrCreateUser function:', error);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async getUser(payload: { email: string }): Promise<UsersProto.User> {
    try {
      const [user] = await this.database
        .select()
        .from(users)
        .where(eq(users.email, payload.email));

      if (!user) {
        console.warn('[WARN] User not found');
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }

      return {
        $type: 'api.users.User',
        id: user.id,
        username: user.username ?? 'UNKNOWN_USERNAME',
        password: user.password ?? 'UNKNOWN_PASSWORD',
        email: user.email ?? 'UNKNOWN_EMAIL',
        refreshToken: user.refreshToken ?? 'UNKOWN_REFRESH_TOKEN',
      } satisfies UsersProto.User;
    } catch (error) {
      console.error('[ERROR] Error in getUser function:', error);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async updateUser(
    request: UsersProto.UpdateUserRequest,
  ): Promise<UsersProto.User> {
    try {
      if (!request.query) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }

      const [user] = await this.database
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, Number(request.query.userId)),
            eq(users.email, request.query.email),
          ),
        );

      if (!user) {
        console.warn('[WARN] User not found');
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }

      const refreshTokenData = {
        refreshToken: request.data?.refreshToken,
      } as Partial<User>;

      const [updatedUser] = await this.database
        .update(users)
        .set(refreshTokenData)
        .where(
          and(
            eq(users.id, Number(request.query.userId)),
            eq(users.email, request.query.email),
          ),
        )
        .returning();

      if (!updatedUser) {
        console.warn('[WARN] User not found');
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }

      return {
        $type: 'api.users.User',
        id: updatedUser.id,
        username: updatedUser.username ?? 'UNKNOWN_USERNAME',
        email: updatedUser.email ?? 'UNKNOWN_EMAIL',
        refreshToken: updatedUser.refreshToken ?? 'UNKOWN_REFRESH_TOKEN',
      } satisfies UsersProto.User;
    } catch (error) {
      console.error('[ERROR] Error in updateUser function:', error);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async getCurrentUserBasic(
    user: UsersProto.User,
  ): Promise<UsersProto.GetCurrentUserResponse> {
    try {
      const [userBasicData] = await this.database
        .select()
        .from(users)
        .where(eq(users.id, user.id));

      if (!userBasicData) {
        return {
          $type: 'api.users.GetCurrentUserResponse',
          id: user.id,
          username: 'UNKNOWN_USERNAME',
          email: user.email,
        };
      }

      return {
        $type: 'api.users.GetCurrentUserResponse',
        id: user.id,
        username: userBasicData.username ?? 'UNKNOWN_USERNAME',
        email: user.email,
      };
    } catch (error) {
      console.error('[ERROR] Error in getCurrentUserBasic function:', error);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }

  public async createProfile(
    profileDto: UsersProto.CreateProfileDto,
  ): Promise<UsersProto.Profile> {
    try {
      const [profileData] = await this.database
        .insert(profile)
        .values(profileDto)
        .returning();

      if (!profileData) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Failed to create a new profile',
        });
      }

      return {
        $type: 'api.users.Profile',
        ...profileData,
        userId: profileData.userId ?? 0,
        bio: profileData.biography ?? 'UNKNOWN_BIO',
        location: 'UNKNOWN_LOCATION',
        website: 'UNKNOWN_WEBSITE',
      } satisfies UsersProto.Profile;
    } catch (error) {
      console.error('[ERROR] Error in createProfile function:', error);
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : 'Internal error',
      });
    }
  }
}
