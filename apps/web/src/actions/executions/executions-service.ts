import {
  type ExecutionsEndpoints,
  type PendingChange,
} from "@repo/types/src/api-client/executions-endpoints";
import { type WorkflowsEndpoints } from "@repo/types/src/api-client/workflows-endpoints";
import { ApiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";

/**
 * Service class for execution-related API calls
 */
export class ExecutionsService {
  private static readonly EXECUTIONS_PATH = "/executions";
  private static readonly WORKFLOWS_PATH = "/workflows";

  /**
   * Approves or rejects pending changes
   */
  static async approvePendingChanges(
    request: Readonly<ExecutionsEndpoints["approveChanges"]["request"]>,
  ): Promise<void> {
    try {
      const response = await ApiClient.post<
        ExecutionsEndpoints["approveChanges"]["body"],
        ExecutionsEndpoints["approveChanges"]["response"]
      >(`${this.EXECUTIONS_PATH}/${String(request.executionId)}/approve`, {
        body: { decision: request.decision === "approve" },
      });

      if (!response.success) {
        throw new Error("Failed to approve changes");
      }
    } catch (error) {
      console.error("Failed to approve changes:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches pending changes for an execution
   */
  static async getPendingChanges(
    request: Readonly<ExecutionsEndpoints["getPendingChanges"]["request"]>,
  ): Promise<{
    pendingApproval: PendingChange[];
    status: string;
  }> {
    try {
      const response = await ApiClient.get<
        ExecutionsEndpoints["getPendingChanges"]["response"]
      >(
        `${this.EXECUTIONS_PATH}/${String(request.executionId)}/pending-changes`,
      );

      if (!response.success) {
        throw new Error("Failed to fetch pending changes");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch pending changes:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Runs a workflow
   */
  static async runWorkflow(
    request: Readonly<WorkflowsEndpoints["runWorkflow"]["request"]>,
  ): Promise<WorkflowsEndpoints["runWorkflow"]["response"]> {
    try {
      const response = await ApiClient.post<
        WorkflowsEndpoints["runWorkflow"]["body"],
        WorkflowsEndpoints["runWorkflow"]["response"]
      >(`${this.WORKFLOWS_PATH}/run-workflow`, {
        body: request,
      });

      if (!response.success) {
        throw new Error("Failed to run workflow");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to run workflow:", error);
      throw new Error(getErrorMessage(error));
    }
  }
}
