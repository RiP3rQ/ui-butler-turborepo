import { type IWorkflowExecutionStatus } from "./workflow";

export interface ExecutionPhase {
  number: number;
  id: number;
  name: string;
  userId: number;
  creditsCost: number | null;
  status: string;
  startedAt: Date;
  completedAt: Date;
  workflowExecutionId: number;
  node: string;
  inputs: string;
  outputs: string;
  logs?: ExecutionLog[];
}

export interface ExecutionLog {
  id: number;
  executionPhaseId: number;
  logLevel: string;
  message: string;
  timestamp: Date;
}

export interface ApproveChangesRequest {
  status: IWorkflowExecutionStatus;
  pendingApproval: {
    "Original code": string;
    "Pending code": string;
  };
}
