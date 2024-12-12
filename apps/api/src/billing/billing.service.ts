import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { DrizzleDatabase } from '../database/merged-schemas';
import { User } from '../database/schemas/users';

@Injectable()
export class BillingService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: DrizzleDatabase,
  ) {}

  // GET /billing/user-setup
  async setupUser(user: User) {}

  // GET /billing/purchase-pack?packId=${packId}
  async purchasePack(user: User, packId: number) {}

  // GET /billing/credits
  async getUserCredits(user: User) {}
}
