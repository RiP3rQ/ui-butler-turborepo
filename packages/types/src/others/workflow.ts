import type { LucideProps } from "lucide-react";
import type { TaskParam, TaskType } from "./tasks";
import type { AppNode, AppNodeMissingInputs } from "./react-flow";

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
  inputs: readonly TaskParam[];
  outputs: readonly TaskParam[];
  temp?: readonly TaskParam[];
  credits: number;
  creditsWithoutApiKey?: number;
}

export interface WorkflowTask extends BaseWorkflowTask {
  icon: (props: LucideProps) => React.JSX.Element;
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
  WAITING_FOR_APPROVAL: "WAITING_FOR_APPROVAL",
} as const;

export type IWorkflowExecutionStatus =
  (typeof WorkflowExecutionStatus)[keyof typeof WorkflowExecutionStatus];

export const ExecutionPhaseStatus = {
  CREATED: "CREATED",
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  FAILED: "FAILED",
  COMPLETED: "COMPLETED",
  WAITING_FOR_APPROVAL: "WAITING_FOR_APPROVAL",
} as const;

export type IExecutionPhaseStatus =
  (typeof ExecutionPhaseStatus)[keyof typeof ExecutionPhaseStatus];

export const WorkflowExecutionTrigger = {
  MANUAL: "MANUAL",
} as const;

export type IWorkflowExecutionTrigger =
  (typeof WorkflowExecutionTrigger)[keyof typeof WorkflowExecutionTrigger];
