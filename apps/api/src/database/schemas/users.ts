import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique(),
  username: text('username'), // backfill
  password: text('password').notNull(),
  refreshToken: text('refresh_token'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const userRelations = relations(users, ({ one }) => ({
  profile: one(profile),
}));

export const profile = pgTable('profile', {
  id: serial('id').primaryKey(),
  age: integer('age'),
  biography: text('biography'),
  userId: integer('user_id').references(() => users.id),
  avatar: text('avatar_url'),
});

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(users, { fields: [profile.userId], references: [users.id] }),
}));
