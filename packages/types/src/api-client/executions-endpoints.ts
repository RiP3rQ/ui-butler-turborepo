export type ApprovalDecision = "approve" | "reject";

export interface ExecutionsEndpoints {
  /** GET /executions/:executionId/pending-changes */
  getPendingChanges: {
    params: {
      executionId: number;
    };
    response: {
      pendingApproval: Record<string, string>;
      status: string;
    };
    request: {
      executionId: number;
    };
  };

  /** POST /executions/:executionId/approve */
  approveChanges: {
    params: {
      executionId: number;
    };
    body: {
      decision: ApprovalDecision;
    };
    response: {
      message: string;
      status: string;
    };
    request: {
      executionId: number;
      decision: ApprovalDecision;
    };
  };
}
