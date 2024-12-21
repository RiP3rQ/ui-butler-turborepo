export interface GetWorkflowRequest {
  workflowId: string;
}

export interface GetHistoricExecutionsRequest {
  workflowId: number;
}

export interface GetExecutionDetailsRequest {
  executionId: string;
}

export interface GetPhaseDetailsRequest {
  phaseId: number;
}

export interface PublishWorkflowRequest {
  workflowId: number;
  flowDefinition: string;
}

export interface RunWorkflowRequest {
  workflowId: number;
  flowDefinition?: string;
}

export interface UpdateWorkflowRequest {
  workflowId: number;
  definition: string;
}
