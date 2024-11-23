import type { LucideProps } from "lucide-react";
import type { TaskParam, TaskType } from "./task";
import type { AppNode, AppNodeMissingInputs } from "./appNode";

export const WorkflowStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export type IWorkflowStatus =
  (typeof WorkflowStatus)[keyof typeof WorkflowStatus];

export interface BaseWorkflowTask {
  label: string;
  type: TaskType;
  isEntryPoint?: boolean;
  inputs: TaskParam[];
  outputs: TaskParam[];
  credits: number;
}

export interface WorkflowTask extends BaseWorkflowTask {
  icon: (props: LucideProps) => JSX.Element;
}

export type WorkflowExecutionPlan = WorkflowExecutionPlanPhase[];

export interface WorkflowExecutionPlanPhase {
  phase: number;
  nodes: AppNode[];
}

export const FlowToExecutionPlanValidationType = {
  NO_ENTRY_POINT: "NO_ENTRY_POINT",
  INVALID_INPUTS: "INVALID_INPUTS",
} as const;

export type IFlowToExecutionPlanValidationType =
  (typeof FlowToExecutionPlanValidationType)[keyof typeof FlowToExecutionPlanValidationType];

export interface WorkflowExecutionPlanError {
  type: IFlowToExecutionPlanValidationType;
  invalidElements?: AppNodeMissingInputs[];
}

export const WorkflowExecutionStatus = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  FAILED: "FAILED",
  COMPLETED: "COMPLETED",
} as const;

export type IWorkflowExecutionStatus =
  (typeof WorkflowExecutionStatus)[keyof typeof WorkflowExecutionStatus];

export const ExecutionPhaseStatus = {
  CREATED: "CREATED",
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  FAILED: "FAILED",
  COMPLETED: "COMPLETED",
} as const;

export type IExecutionPhaseStatus =
  (typeof ExecutionPhaseStatus)[keyof typeof ExecutionPhaseStatus];

export const WorkflowExecutionTrigger = {
  MANUAL: "MANUAL",
  CRON: "CRON",
} as const;

export type IWorkflowExecutionTrigger =
  (typeof WorkflowExecutionTrigger)[keyof typeof WorkflowExecutionTrigger];

export interface WorkflowType {
  id: number;
  name: string;
  userId: number | null;
  description: string | null;
  definition: string;
  executionPlan: string | null;
  creditsCost: number | null;
  status: IWorkflowStatus;
  lastRunAt?: Date;
  lastRunId?: string;
  lastRunStatus?: string;
  nextRunAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
