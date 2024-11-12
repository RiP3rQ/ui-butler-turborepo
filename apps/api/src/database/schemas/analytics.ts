import { relations } from 'drizzle-orm';
import { integer, pgTable, serial } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userBalance = pgTable('user_balance', {
  id: serial('id').primaryKey(),
  balance: integer('balance').default(0),
});

export const userBalanceRelations = relations(userBalance, ({ one }) => ({
  users: one(users),
}));
