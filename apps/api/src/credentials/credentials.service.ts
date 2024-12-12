import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import type { DrizzleDatabase } from '../database/merged-schemas';

@Injectable()
export class CredentialsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  // GET /credentials
  async getUserCredentials(user: User) {
    const userCredentials = await this.database
      .select()
      .from(credentials)
      .where(eq(credentials.userId, user.id));

    if (!userCredentials) {
      throw new NotFoundException('Credentials not found');
    }

    return userCredentials satisfies CredentialType[];
  }

  // POST /credentials
  async createCredential(user: User) {
    const newCredential = await this.database
      .insert({
        userId: user.id,
        credential: 'New Credential',
      })
      .into(credentials)
      .then((rows) => rows[0]);

    return newCredential;
  }

  // DELETE /credentials?id=${id}
  async deleteCredential(user: User, id: number) {
    const deletedCredential = await this.database
      .delete()
      .from(credentials)
      .where(and(eq(credentials.userId, user.id), eq(credentials.id, id)))
      .then((rows) => rows[0]);

    return deletedCredential;
  }
}
