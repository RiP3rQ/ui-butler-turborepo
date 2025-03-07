import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { projects } from "./projects";

export const components = pgTable("components", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),

  code: text("code").notNull(),
  e2eTests: text("e2e_tests"),
  unitTests: text("unit_tests"),
  mdxDocs: text("mdx_docs"),
  tsDocs: text("ts_docs"),

  isFavorite: boolean("is_favorite").default(false),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
