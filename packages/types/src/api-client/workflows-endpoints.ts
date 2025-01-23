import { type WorkflowExecution } from "../workflow-execution";

export interface Workflow {
  id: number;
  name: string;
  description: string;
  definition?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowPhase {
  id: number;
  name: string;
  status: string;
  logs: string[];
  startedAt: string;
  completedAt?: string;
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
      phases: WorkflowPhase[];
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
      phase: WorkflowPhase;
      logs: string[];
    };
    request: {
      phaseId: number;
    };
  };
}
