export type ApprovalDecision = "approve" | "reject";

export interface ApprovePendingChangesRequest {
  executionId: number;
  decision: ApprovalDecision;
}

export interface GetPendingChangesRequest {
  executionId: number;
}

export interface RunWorkflowRequest {
  workflowId: number;
  componentId?: number;
  flowDefinition?: string;
}

export interface WorkflowRunResponse {
  url: string;
}
