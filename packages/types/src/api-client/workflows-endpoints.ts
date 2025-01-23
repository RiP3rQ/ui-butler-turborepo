import {
  type IWorkflowStatus,
  type IWorkflowExecutionStatus,
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
  userId: number | null;
  description: string | null;
  definition: string;
  executionPlan: string | null;
  creditsCost: number | null;
  isPublished: boolean;
  status: IWorkflowStatus;
  lastRunAt?: Date;
  lastRunId?: string;
  lastRunStatus?: string;
  nextRunAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionLog {
  id: number;
  executionPhaseId: number;
  logLevel: string;
  message: string;
  timestamp: Date;
}

export interface ExecutionPhase {
  number: number;
  id: number;
  name: string;
  userId: number;
  creditsCost: number | null;
  status: string;
  startedAt: Date | null;
  completedAt: Date | null;
  workflowExecutionId: number;
  node: string | null;
  inputs: string | null;
  outputs: string | null;
  logs?: ExecutionLog[];
}

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

export interface WorkflowsEndpoints {
  /** GET /workflows */
  getAllUserWorkflows: {
    response: Workflow[];
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
      componentId: number;
    };
    response: {
      url: string;
      executionId: number;
    };
    request: {
      workflowId: number;
      flowDefinition?: string;
      componentId: number;
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
      logs: string[];
    };
    request: {
      phaseId: number;
    };
  };
}
