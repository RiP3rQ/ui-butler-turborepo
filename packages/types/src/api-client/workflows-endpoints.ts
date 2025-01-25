import type { ProtoTimestamp } from "../others/proto-timestamp";
import {
  type IWorkflowExecutionStatus,
  type IWorkflowStatus,
} from "../others/workflow";

export interface ApproveChangesRequest {
  status: IWorkflowExecutionStatus;
  pendingApproval: {
    "Original code": string;
    "Pending code": string;
  };
}

export interface Workflow {
  id: number;
  name: string;
  userId: number;
  description: string | null;
  definition: string;
  executionPlan: string | null;
  creditsCost: number | null;
  status: IWorkflowStatus;
  lastRunAt?: ProtoTimestamp;
  lastRunId?: string;
  lastRunStatus?: string;
  nextRunAt?: ProtoTimestamp | null;
  createdAt: ProtoTimestamp;
  updatedAt: ProtoTimestamp;
}

export interface ExecutionLog {
  id: number;
  executionPhaseId: number;
  logLevel: string;
  message: string;
  timestamp: ProtoTimestamp;
}

export interface ExecutionPhase {
  number: number;
  id: number;
  name: string;
  userId: number;
  creditsCost: number | null;
  status: string;
  startedAt: ProtoTimestamp | null;
  completedAt: ProtoTimestamp | null;
  workflowExecutionId: number;
  node: string | null;
  inputs: string | null;
  outputs: string | null;
}

export interface ExecutionPhaseWithDatesInsteadOfProtoTimestamp
  extends Omit<ExecutionPhase, "startedAt" | "completedAt"> {
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface WorkflowExecution {
  id: number;
  userId: number;
  definition: string;
  status: string;
  createdAt: ProtoTimestamp | null;
  workflowId: number;
  trigger: string | null;
  creditsConsumed: number | null;
  startedAt: ProtoTimestamp | null;
  completedAt: ProtoTimestamp | null;
}

export interface WorkflowExecutionWithDatesInsteadOfProtoTimestamp
  extends Omit<WorkflowExecution, "createdAt" | "startedAt" | "completedAt"> {
  createdAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface WorkflowsEndpoints {
  /** GET /workflows */
  getAllUserWorkflows: {
    response: {
      workflows: Workflow[];
    };
  };

  /** GET /workflows/get-by-id/:workflowId */
  getWorkflowById: {
    params: {
      workflowId: number;
    };
    response: Workflow;
    request: {
      workflowId: number;
    };
  };

  /** POST /workflows */
  createWorkflow: {
    body: {
      name: string;
      description?: string | undefined;
      definition?: string | undefined;
    };
    response: Workflow;
    request: {
      name: string;
      description: string;
    };
  };

  /** DELETE /workflows/:id */
  deleteWorkflow: {
    params: {
      id: number;
    };
    response: Workflow;
    request: {
      id: number;
    };
  };

  /** POST /workflows/duplicate */
  duplicateWorkflow: {
    body: {
      name: string;
      workflowId: number;
      description?: string | undefined;
      definition?: string | undefined;
    };
    response: Workflow;
    request: {
      workflowId: number;
      name: string;
      description: string;
    };
  };

  /** POST /workflows/:id/publish */
  publishWorkflow: {
    params: {
      id: number;
    };
    body: {
      workflowId: number;
      flowDefinition: string;
    };
    response: Workflow;
    request: {
      workflowId: number;
      flowDefinition: string;
    };
  };

  /** POST /workflows/:id/unpublish */
  unpublishWorkflow: {
    params: {
      id: number;
    };
    response: Workflow;
    request: {
      id: number;
    };
  };

  /** POST /workflows/run-workflow */
  runWorkflow: {
    body: {
      workflowId: number;
      flowDefinition?: string;
      componentId?: number;
    };
    response: {
      url: string;
      executionId: number;
    };
    request: {
      workflowId: number;
      flowDefinition?: string;
      componentId?: number;
    };
  };

  /** PATCH /workflows */
  updateWorkflow: {
    body: {
      workflowId: number;
      definition: string;
    };
    response: Workflow;
    request: {
      workflowId: number;
      definition: string;
    };
  };

  /** GET /workflows/historic */
  getHistoricWorkflowExecutions: {
    query: {
      workflowId: number;
    };
    response: WorkflowExecution[];
    request: {
      workflowId: number;
    };
  };

  /** GET /workflows/executions */
  getWorkflowExecutions: {
    query: {
      executionId: string | number;
    };
    response: {
      execution: WorkflowExecution;
      phases: ExecutionPhase[];
    };
    request: {
      executionId: string | number;
    };
  };

  /** GET /workflows/phases/:id */
  getWorkflowPhase: {
    params: {
      id: number;
    };
    response: {
      phase: ExecutionPhase;
      logs?: ExecutionLog[];
    };
    request: {
      phaseId: number;
    };
  };
}
