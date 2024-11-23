import type { ExecutionPhase } from './phase-execution';

export interface WorkflowExecution {
  id: number;
  userId: number;
  definition: string;
  status: string;
  createdAt: Date;
  workflowId: number;
  trigger: string;
  creditsConsumed: number;
  startedAt: Date;
  completedAt: Date;
}

export interface WorkflowExecutionWithPhases {
  id: number;
  userId: number;
  definition: string;
  status: string;
  createdAt: Date;
  workflowId: number;
  trigger: string;
  creditsConsumed: number;
  startedAt: Date;
  completedAt: Date;
  phases: ExecutionPhase[];
}
