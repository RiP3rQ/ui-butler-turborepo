import { LucideIcon } from "lucide-react";
import { TaskParam, TaskType } from "./task";
import { AppNode, AppNodeMissingInputs } from "./appNode";

export enum WorkflowStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

export interface BaseWorkflowTask {
  label: string;
  type: TaskType;
  isEntryPoint?: boolean;
  inputs: TaskParam[];
  outputs: TaskParam[];
  credits: number;
}

export interface WorkflowTask extends BaseWorkflowTask {
  icon: (props: LucideIcon) => JSX.Element;
}

export type WorkflowExecutionPlan = WorkflowExecutionPlanPhase[];

export type WorkflowExecutionPlanPhase = {
  phase: number;
  nodes: AppNode[];
};

export enum FlowToExecutionPlanValidationType {
  "NO_ENTRY_POINT" = "NO_ENTRY_POINT",
  "INVALID_INPUTS" = "INVALID_INPUTS",
}

export type WorkflowExecutionPlanError = {
  type: FlowToExecutionPlanValidationType;
  invalidElements?: AppNodeMissingInputs[];
};

export enum WorkflowExecutionStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
}

export enum ExecutionPhaseStatus {
  CREATED = "CREATED",
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
}

export enum WorkflowExecutionTrigger {
  MANUAL = "MANUAL",
  CRON = "CRON",
}

export type WorkflowType = {
  id: number;
  name: string;
  userId: number | null;
  description: string | null;
  definition: string;
  executionPlan: string | null;
  creditsCost: number | null;
  status: WorkflowStatus;
  lastRunAt?: Date;
  lastRunId?: string;
  lastRunStatus?: string;
  nextRunAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
