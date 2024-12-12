import { relations, sql } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const userCredentials = pgTable(
  'user_credentials',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    name: text('name').notNull(),
    value: text('value').notNull(),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => ({
    userIdNameUnique: unique('credentials_user_id_name_unique').on(
      table.userId,
      table.name,
    ),
    userIdIndex: index('user_id_index').on(table.userId),
  }),
);

export const userCredentialsRelations = relations(
  userCredentials,
  ({ many, one }) => ({
    users: one(users, {
      fields: [userCredentials.userId],
      references: [users.id],
    }),
  }),
);

export type NewUserCredential = typeof userCredentials.$inferInsert;
