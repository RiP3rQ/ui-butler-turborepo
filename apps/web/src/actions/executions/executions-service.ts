import type { ApproveChangesRequest } from "@repo/types";
import { ApiClient } from "@/lib/api-client";
import {
  type ApprovePendingChangesRequest,
  type GetPendingChangesRequest,
  type RunWorkflowRequest,
  type WorkflowRunResponse,
} from "@/actions/executions/types";

/**
 * Service class for execution-related API calls
 */
export class ExecutionsService {
  private static readonly EXECUTIONS_PATH = "/executions-executions";
  private static readonly WORKFLOWS_PATH = "/workflows";

  /**
   * Approves or rejects pending changes
   */
  static async approvePendingChanges({
    executionId,
    decision,
  }: Readonly<ApprovePendingChangesRequest>): Promise<void> {
    try {
      await ApiClient.post<{ decision: string }, void>(
        `${this.EXECUTIONS_PATH}/${executionId.toString()}/approve`,
        {
          body: { decision },
        },
      );
    } catch (error) {
      console.error("Failed to approve changes:", error);
      throw new Error("Failed to approve changes");
    }
  }

  /**
   * Fetches pending changes for an execution
   */
  static async getPendingChanges({
    executionId,
  }: Readonly<GetPendingChangesRequest>): Promise<ApproveChangesRequest> {
    try {
      const { data } = await ApiClient.get<ApproveChangesRequest>(
        `${this.EXECUTIONS_PATH}/${executionId.toString()}/pending-changes`,
      );
      return data;
    } catch (error) {
      console.error("Failed to fetch pending changes:", error);
      throw new Error("Failed to fetch pending changes");
    }
  }

  /**
   * Runs a workflow
   */
  static async runWorkflow(
    request: Readonly<RunWorkflowRequest>,
  ): Promise<WorkflowRunResponse> {
    try {
      const { data } = await ApiClient.post<
        RunWorkflowRequest,
        WorkflowRunResponse
      >(`${this.WORKFLOWS_PATH}/run-workflow`, {
        body: request,
      });
      return data;
    } catch (error) {
      console.error("Failed to run workflow:", error);
      throw new Error("Failed to run workflow");
    }
  }
}
