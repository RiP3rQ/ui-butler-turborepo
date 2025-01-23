export type ApprovalDecision = "approve" | "reject";

export interface PendingChange {
  id: number;
  type: string;
  content: string;
  status: string;
}

export interface ExecutionsEndpoints {
  /** GET /executions/:executionId/pending-changes */
  getPendingChanges: {
    params: {
      executionId: number;
    };
    response: {
      pendingApproval: PendingChange[];
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
      decision: boolean;
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
