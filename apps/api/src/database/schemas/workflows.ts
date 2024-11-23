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
import { workflowExecutions } from './workflow-executions';

export const workflows = pgTable(
  'workflows',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status').default('DRAFT'),
    definition: text('definition').notNull().default('{}'),
    executionPlan: text('execution_plan'),
    creditsCost: integer('credits_cost').default(0),
    lastRunAt: timestamp('last_run_at'),
    lastRunId: text('last_run_id'),
    lastRunStatus: text('last_run_status'),
    nextRunAt: timestamp('next_run_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => ({
    userIdNameUnique: unique('workflows_user_id_name_unique').on(
      table.userId,
      table.name,
    ),
    userIdIndex: index('workflows_user_id_idx').on(table.userId),
  }),
);
export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = {
  userId: number;
  name: string;
  description?: string;
  definition: string;
  creditsCost?: number;
  executionPlan?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const workflowRelations = relations(workflows, ({ one, many }) => ({
  users: one(users, {
    fields: [workflows.userId],
    references: [users.id],
  }),
  workflowExecutions: many(workflowExecutions),
}));
