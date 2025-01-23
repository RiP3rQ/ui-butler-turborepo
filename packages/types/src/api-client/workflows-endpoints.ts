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
  };

  /** POST /workflows */
  createWorkflow: {
    body: {
      name: string;
      description: string;
    };
    response: Workflow;
  };

  /** DELETE /workflows/:id */
  deleteWorkflow: {
    params: {
      id: number;
    };
    response: Workflow;
  };

  /** POST /workflows/duplicate */
  duplicateWorkflow: {
    body: {
      workflowId: number;
      name: string;
      description: string;
    };
    response: Workflow;
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
  };

  /** POST /workflows/:id/unpublish */
  unpublishWorkflow: {
    params: {
      id: number;
    };
    response: Workflow;
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
  };

  /** PATCH /workflows */
  updateWorkflow: {
    body: {
      workflowId: number;
      definition: string;
    };
    response: Workflow;
  };

  /** GET /workflows/historic */
  getHistoricWorkflowExecutions: {
    query: {
      workflowId: number;
    };
    response: WorkflowExecution[];
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
  };
}
