import type { ExecutionPhase } from "./phase-execution";

export interface WorkflowExecution {
  id: number;
  userId: number;
  definition: string;
  status: string;
  createdAt: Date | null;
  workflowId: number;
  trigger: string;
  creditsConsumed: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface WorkflowExecutionWithPhases {
  id: number;
  userId: number;
  definition: string;
  status: string;
  createdAt: Date | null;
  workflowId: number;
  trigger: string;
  creditsConsumed: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
  phases: ExecutionPhase[];
}
