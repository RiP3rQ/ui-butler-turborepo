import { Inject, Injectable } from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import {
  and,
  DATABASE_CONNECTION,
  desc,
  type DrizzleDatabase,
  eq,
  NewUserCredential,
  userCredentials,
} from '@app/database';
import { symmetricDecrypt, symmetricEncrypt } from '@app/common';
import { UsersProto } from '@app/proto';

@Injectable()
export class CredentialsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  /**
   * Fetches the credentials of a user
   */
  async getUserCredentials(user: UsersProto.User) {
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
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Credentials not found',
        });
      }

      return userCredentialsData;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : JSON.stringify(error),
      });
    }
  }

  async createCredential(
    user: UsersProto.User,
    createCredentialDto: UsersProto.CreateCredentialDto,
  ) {
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
        throw new RpcException({
          code: status.INTERNAL,
          message: 'Credential not created',
        });
      }

      delete newCredential.value;
      return newCredential;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : JSON.stringify(error),
      });
    }
  }

  /**
   * Deletes a credential
   */
  async deleteCredential(user: UsersProto.User, id: number) {
    try {
      const [deletedCredential] = await this.database
        .delete(userCredentials)
        .where(
          and(eq(userCredentials.userId, user.id), eq(userCredentials.id, id)),
        )
        .returning();

      if (!deletedCredential) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Credential not found',
        });
      }

      delete deletedCredential.value;
      return deletedCredential;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : JSON.stringify(error),
      });
    }
  }

  /**
   * Reveals the value of a credential
   */
  async revealCredential(user: UsersProto.User, id: number) {
    try {
      const [credential] = await this.database
        .select()
        .from(userCredentials)
        .where(
          and(eq(userCredentials.userId, user.id), eq(userCredentials.id, id)),
        );

      if (!credential) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Credential not found',
        });
      }

      const decryptedCredentialValue = symmetricDecrypt(credential.value);

      return {
        ...credential,
        value: decryptedCredentialValue,
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : JSON.stringify(error),
      });
    }
  }
}
