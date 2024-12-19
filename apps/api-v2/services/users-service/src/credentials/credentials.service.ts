import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  DATABASE_CONNECTION,
  type DrizzleDatabase,
  NewUserCredential,
  userCredentials,
} from '@app/database';
import { CreateCredentialDto, symmetricEncrypt, User } from '@app/common';
import { and, desc, eq } from 'drizzle-orm';
import { UserCredentials } from '@repo/types';

@Injectable()
export class CredentialsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  async getUserCredentials(user: User): Promise<UserCredentials[]> {
    try {
      const userCredentialsData = await this.database
        .select({
          id: userCredentials.id,
          name: userCredentials.name,
          userId: userCredentials.userId,
          createdAt: userCredentials.createdAt,
          updatedAt: userCredentials.updatedAt,
        })
        .from(userCredentials)
        .where(eq(userCredentials.userId, user.id))
        .orderBy(desc(userCredentials.name));

      if (!userCredentialsData) {
        throw new RpcException('Credentials not found');
      }

      return userCredentialsData;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async createCredential(
    user: User,
    createCredentialDto: CreateCredentialDto,
  ): Promise<UserCredentials> {
    try {
      const encryptedCredentialValue = symmetricEncrypt(
        createCredentialDto.value,
      );

      const newCredentialData: Omit<NewUserCredential, 'id'> = {
        name: createCredentialDto.name,
        value: encryptedCredentialValue,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [newCredential] = await this.database
        .insert(userCredentials)
        .values(newCredentialData)
        .returning();

      if (!newCredential) {
        throw new RpcException('Credential not created');
      }

      delete newCredential.value;
      return newCredential;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }

  async deleteCredential(user: User, id: number): Promise<UserCredentials> {
    try {
      const [deletedCredential] = await this.database
        .delete(userCredentials)
        .where(
          and(eq(userCredentials.userId, user.id), eq(userCredentials.id, id)),
        )
        .returning();

      if (!deletedCredential) {
        throw new RpcException('Credential not found');
      }

      delete deletedCredential.value;
      return deletedCredential;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : JSON.stringify(error),
      );
    }
  }
}
