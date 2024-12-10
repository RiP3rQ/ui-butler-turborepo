import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { relations } from 'drizzle-orm';
import { projects } from './projects';

export const components = pgTable('components', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  projectId: integer('project_id')
    .references(() => projects.id)
    .notNull(),
  code: text('code').notNull(),
  isFavorite: boolean('is_favorite').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
export const componentsRelations = relations(components, ({ one }) => ({
  user: one(users, { fields: [components.userId], references: [users.id] }),
  project: one(projects, {
    fields: [components.projectId],
    references: [projects.id],
  }),
}));

export type Component = typeof components.$inferSelect;
export type NewComponent = typeof components.$inferInsert;
