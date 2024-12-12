import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import type { DrizzleDatabase } from '../database/merged-schemas';
import { User } from '../database/schemas/users';
import {
  NewUserCredential,
  userCredentials,
} from '../database/schemas/credentials';
import { and, desc, eq } from 'drizzle-orm';
import type { UserCredentials } from '@repo/types';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { symmetricEncrypt } from '../common/encryption/symmetric-encryption';

@Injectable()
export class CredentialsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  // GET /credentials
  async getUserCredentials(user: User) {
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
      throw new NotFoundException('Credentials not found');
    }

    return userCredentialsData satisfies UserCredentials[];
  }

  // POST /credentials
  async createCredential(user: User, createCredentialDto: CreateCredentialDto) {
    // Encrypt value
    const encryptedCredentailValue = symmetricEncrypt(
      createCredentialDto.value,
    );

    const newCredentialData = {
      name: createCredentialDto.name,
      value: encryptedCredentailValue,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as NewUserCredential;

    const [newCredential] = await this.database
      .insert(userCredentials)
      .values(newCredentialData)
      .returning();

    if (!newCredential) {
      throw new NotFoundException('Credential not created');
    }

    // Remove the value from the returned credential
    delete newCredential.value;

    return newCredential satisfies UserCredentials;
  }

  // DELETE /credentials?id=${id}
  async deleteCredential(user: User, id: number) {
    const [deletedCredential] = await this.database
      .delete(userCredentials)
      .where(
        and(eq(userCredentials.userId, user.id), eq(userCredentials.id, id)),
      )
      .returning();

    if (!deletedCredential) {
      throw new NotFoundException('Credential not found');
    }

    // Remove the value from the returned credential
    delete deletedCredential.value;

    return deletedCredential satisfies UserCredentials;
  }
}
