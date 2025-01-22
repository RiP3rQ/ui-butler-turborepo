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
  public async getUserCredentials(
    request: UsersProto.GetCredentialsRequest,
  ): Promise<UsersProto.GetCredentialsResponse> {
    try {
      if (!request.user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }

      const userCredentialsData = await this.database
        .select({
          id: userCredentials.id,
          name: userCredentials.name,
          userId: userCredentials.userId,
          createdAt: userCredentials.createdAt,
          updatedAt: userCredentials.updatedAt,
        })
        .from(userCredentials)
        .where(eq(userCredentials.userId, request.user.id))
        .orderBy(desc(userCredentials.name));

      if (userCredentialsData.length === 0) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Credentials not found',
        });
      }

      const credentials = userCredentialsData.map((credential) => ({
        ...credential,
        $type: 'api.users.Credential',
        userId: credential.userId ?? 0,
        createdAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: Math.floor(credential.createdAt.getTime() / 1000),
          nanos: (credential.createdAt.getTime() % 1000) * 1000000,
        },
        updatedAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: Math.floor(credential.updatedAt.getTime() / 1000),
          nanos: (credential.updatedAt.getTime() % 1000) * 1000000,
        },
      })) satisfies UsersProto.Credential[];

      return {
        $type: 'api.users.GetCredentialsResponse',
        credentials,
      };
    } catch (error: unknown) {
      console.error(
        `[ERROR] Error getting user credentials: ${JSON.stringify(error)}`,
      );
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
   * Creates a credential
   */
  public async createCredential(
    request: UsersProto.CreateCredentialRequest,
  ): Promise<UsersProto.Credential> {
    try {
      if (!request.credential) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Credential not found',
        });
      }

      if (!request.user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }

      const encryptedCredentialValue = symmetricEncrypt(
        request.credential.value,
      );

      const newCredentialData: Omit<NewUserCredential, 'id'> = {
        name: request.credential.name,
        value: encryptedCredentialValue,
        userId: request.user.id,
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

      // delete the value from the credential
      const finalCredential = {
        $type: 'api.users.Credential',
        id: newCredential.id,
        name: newCredential.name,
        userId: newCredential.userId ?? 0,
        createdAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: Math.floor(newCredential.createdAt.getTime() / 1000),
          nanos: (newCredential.createdAt.getTime() % 1000) * 1000000,
        },
        updatedAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: Math.floor(newCredential.updatedAt.getTime() / 1000),
          nanos: (newCredential.updatedAt.getTime() % 1000) * 1000000,
        },
      } satisfies UsersProto.Credential;

      return finalCredential;
    } catch (error: unknown) {
      console.error(
        `[ERROR] Error creating credential: ${JSON.stringify(error)}`,
      );
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
  public async deleteCredential(
    request: UsersProto.DeleteCredentialRequest,
  ): Promise<UsersProto.Credential> {
    try {
      if (!request.user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }

      const [deletedCredential] = await this.database
        .delete(userCredentials)
        .where(
          and(
            eq(userCredentials.userId, request.user.id),
            eq(userCredentials.id, request.id),
          ),
        )
        .returning();

      if (!deletedCredential) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Credential not found',
        });
      }

      const finalCredential = {
        $type: 'api.users.Credential',
        id: deletedCredential.id,
        name: deletedCredential.name,
        userId: deletedCredential.userId ?? 0,
        createdAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: Math.floor(deletedCredential.createdAt.getTime() / 1000),
          nanos: (deletedCredential.createdAt.getTime() % 1000) * 1000000,
        },
        updatedAt: {
          $type: 'google.protobuf.Timestamp',
          seconds: Math.floor(deletedCredential.updatedAt.getTime() / 1000),
          nanos: (deletedCredential.updatedAt.getTime() % 1000) * 1000000,
        },
      } satisfies UsersProto.Credential;

      return finalCredential;
    } catch (error: unknown) {
      console.error(
        `[ERROR] Error deleting credential: ${JSON.stringify(error)}`,
      );
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
  public async revealCredential(
    request: UsersProto.RevealCredentialRequest,
  ): Promise<UsersProto.RevealedCredential> {
    try {
      if (!request.user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }

      const [credential] = await this.database
        .select()
        .from(userCredentials)
        .where(
          and(
            eq(userCredentials.userId, request.user.id),
            eq(userCredentials.id, request.id),
          ),
        );

      if (!credential) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Credential not found',
        });
      }

      const decryptedCredentialValue = symmetricDecrypt(credential.value);

      const finalCredential = {
        $type: 'api.users.RevealedCredential',
        id: credential.id,
        name: credential.name,
        userId: credential.userId ?? 0,
        value: decryptedCredentialValue,
      } satisfies UsersProto.RevealedCredential;

      return finalCredential;
    } catch (error: unknown) {
      console.error(
        `[ERROR] Error revealing credential: ${JSON.stringify(error)}`,
      );
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
