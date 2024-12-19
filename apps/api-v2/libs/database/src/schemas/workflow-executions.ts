import { workflows } from "./workflows";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const workflowExecutions = pgTable(
  "workflow_executions",
  {
    id: serial("id").primaryKey(),
    workflowId: integer("workflow_id")
      .references(() => workflows.id)
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),

    trigger: text("trigger").notNull(),
    status: text("status").notNull(),

    definition: text("definition").notNull().default("{}"),
    creditsConsumed: integer("credits_consumed").default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    userIdIndex: index("executions_user_id_idx").on(table.userId),
  }),
);

export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type NewWorkflowExecution = typeof workflowExecutions.$inferInsert;

export const workflowExecutionRelations = relations(
  workflowExecutions,
  ({ one, many }) => ({
    users: one(users, {
      fields: [workflowExecutions.userId],
      references: [users.id],
    }),
    workflow: one(workflows, {
      fields: [workflowExecutions.workflowId],
      references: [workflows.id],
    }),
    executionPhases: many(executionPhase),
  }),
);

export const executionPhase = pgTable(
  "execution_phases",
  {
    id: serial("id").primaryKey(),
    workflowExecutionId: integer("workflow_execution_id")
      .references(() => workflowExecutions.id)
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),

    status: text("status").notNull(),
    number: integer("number").notNull(),
    node: text("node").notNull(),
    name: text("name").notNull(),

    inputs: text("inputs"),
    outputs: text("outputs"),
    temp: text("temp"),

    creditsCost: integer("credits_cost"),

    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    userIdIndex: index("user_id_idx").on(table.userId),
    workflowExecutionIdIndex: index("workflow_execution_id_index").on(
      table.workflowExecutionId,
    ),
  }),
);

export const executionPhaseRelations = relations(
  executionPhase,
  ({ one, many }) => ({
    workflowExecution: one(workflowExecutions, {
      fields: [executionPhase.workflowExecutionId],
      references: [workflowExecutions.id],
    }),
    executionLogs: many(executionLog),
  }),
);

export const executionLog = pgTable(
  "execution_logs",
  {
    id: serial("id").primaryKey(),
    executionPhaseId: integer("execution_phase_id")
      .references(() => executionPhase.id)
      .notNull(),

    logLevel: text("log_level").notNull(),
    message: text("message").notNull(),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
  },
  (table) => ({
    executionPhaseIdIndex: index("execution_phase_id_index").on(
      table.executionPhaseId,
    ),
  }),
);

export const executionLogRelations = relations(executionLog, ({ one }) => ({
  executionPhase: one(executionPhase),
}));
