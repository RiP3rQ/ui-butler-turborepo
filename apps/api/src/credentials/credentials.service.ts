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
import { symmetricDecrypt } from '../common/encryption/symmetric-decryption';

@Injectable()
export class CredentialsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  // GET /credentials
  async getUserCredentials(user: User) {
    const userCredentialsData = await this.database
      .select()
      .from(userCredentials)
      .where(eq(userCredentials.userId, user.id))
      .orderBy(desc(userCredentials.name));

    if (!userCredentials) {
      throw new NotFoundException('Credentials not found');
    }

    const encryptedCredentials = userCredentialsData.map((credential) => ({
      ...credential,
      value: symmetricDecrypt(credential.value),
    }));

    return encryptedCredentials satisfies UserCredentials[];
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

    return deletedCredential satisfies UserCredentials;
  }
}
