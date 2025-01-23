import { ApiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  type CreateWorkflowSchemaType,
  type DuplicateWorkflowSchemaType,
} from "@/schemas/workflow";
import {
  type Workflow,
  type WorkflowExecution,
  type WorkflowsEndpoints,
} from "@shared/types/src/api-client/workflows-endpoints";

/**
 * Service class for workflow-related API calls
 */
export class WorkflowService {
  private static readonly BASE_PATH = "/workflows";

  /**
   * Creates a new workflow
   */
  static async createWorkflow(
    form: Readonly<CreateWorkflowSchemaType>,
  ): Promise<Workflow> {
    try {
      const response = await ApiClient.post<
        WorkflowsEndpoints["createWorkflow"]["body"],
        WorkflowsEndpoints["createWorkflow"]["response"]
      >(this.BASE_PATH, { body: form });

      if (!response.success) {
        throw new Error("Failed to create workflow");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create workflow:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Deletes a workflow
   */
  static async deleteWorkflow(workflowId: number): Promise<Workflow> {
    try {
      const response = await ApiClient.delete<
        WorkflowsEndpoints["deleteWorkflow"]["response"]
      >(this.BASE_PATH, {
        params: { id: String(workflowId) },
      });

      if (!response.success) {
        throw new Error("Failed to delete workflow");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to delete workflow:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Duplicates a workflow
   */
  static async duplicateWorkflow(
    form: Readonly<DuplicateWorkflowSchemaType>,
  ): Promise<Workflow> {
    try {
      const response = await ApiClient.post<
        WorkflowsEndpoints["duplicateWorkflow"]["body"],
        WorkflowsEndpoints["duplicateWorkflow"]["response"]
      >(`${this.BASE_PATH}/duplicate`, { body: form });

      if (!response.success) {
        throw new Error("Failed to duplicate workflow");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to duplicate workflow:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches historic workflow executions
   */
  static async getHistoricExecutions(
    request: Readonly<
      WorkflowsEndpoints["getHistoricWorkflowExecutions"]["request"]
    >,
  ): Promise<WorkflowExecution[]> {
    try {
      const response = await ApiClient.get<
        WorkflowsEndpoints["getHistoricWorkflowExecutions"]["response"]
      >(`${this.BASE_PATH}/historic`, {
        params: { workflowId: String(request.workflowId) },
      });

      if (!response.success) {
        throw new Error("Failed to fetch workflow history");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch workflow history:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches workflow by ID
   */
  static async getWorkflowById(
    request: Readonly<WorkflowsEndpoints["getWorkflowById"]["request"]>,
  ): Promise<Workflow> {
    try {
      if (!request.workflowId) {
        throw new Error("Workflow ID is required");
      }

      const response = await ApiClient.get<
        WorkflowsEndpoints["getWorkflowById"]["response"]
      >(`${this.BASE_PATH}/get-by-id/${String(request.workflowId)}`);

      if (!response.success) {
        throw new Error("Failed to fetch workflow");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch workflow:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches workflow execution details
   */
  static async getExecutionDetails(
    request: Readonly<WorkflowsEndpoints["getWorkflowExecutions"]["request"]>,
  ): Promise<WorkflowsEndpoints["getWorkflowExecutions"]["response"]> {
    try {
      const response = await ApiClient.get<
        WorkflowsEndpoints["getWorkflowExecutions"]["response"]
      >(`${this.BASE_PATH}/executions`, {
        params: { executionId: String(request.executionId) },
      });

      if (!response.success) {
        throw new Error("Failed to fetch execution details");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch execution details:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches workflow phase details
   */
  static async getPhaseDetails(
    request: Readonly<WorkflowsEndpoints["getWorkflowPhase"]["request"]>,
  ): Promise<WorkflowsEndpoints["getWorkflowPhase"]["response"]> {
    try {
      const response = await ApiClient.get<
        WorkflowsEndpoints["getWorkflowPhase"]["response"]
      >(`${this.BASE_PATH}/phases/${String(request.phaseId)}`);

      if (!response.success) {
        throw new Error("Failed to fetch phase details");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch phase details:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Fetches all user workflows
   */
  static async getUserWorkflows(): Promise<Workflow[]> {
    try {
      const response = await ApiClient.get<
        WorkflowsEndpoints["getAllUserWorkflows"]["response"]
      >(this.BASE_PATH);

      if (!response.success) {
        throw new Error("Failed to fetch user workflows");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch user workflows:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Publishes a workflow
   */
  static async publishWorkflow(
    request: Readonly<WorkflowsEndpoints["publishWorkflow"]["request"]>,
  ): Promise<Workflow> {
    try {
      const response = await ApiClient.post<
        WorkflowsEndpoints["publishWorkflow"]["body"],
        WorkflowsEndpoints["publishWorkflow"]["response"]
      >(`${this.BASE_PATH}/${String(request.workflowId)}/publish`, {
        body: {
          workflowId: request.workflowId,
          flowDefinition: request.flowDefinition,
        },
      });

      if (!response.success) {
        throw new Error("Failed to publish workflow");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to publish workflow:", error);
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
      >(`${this.BASE_PATH}/run-workflow`, {
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

  /**
   * Unpublishes a workflow
   */
  static async unpublishWorkflow(workflowId: number): Promise<void> {
    try {
      const response = await ApiClient.post<
        never,
        WorkflowsEndpoints["unpublishWorkflow"]["response"]
      >(`${this.BASE_PATH}/${String(workflowId)}/unpublish`);

      if (!response.success) {
        throw new Error("Failed to unpublish workflow");
      }
    } catch (error) {
      console.error("Failed to unpublish workflow:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Updates a workflow
   */
  static async updateWorkflow(
    request: Readonly<WorkflowsEndpoints["updateWorkflow"]["request"]>,
  ): Promise<Workflow> {
    try {
      const response = await ApiClient.patch<
        WorkflowsEndpoints["updateWorkflow"]["body"],
        WorkflowsEndpoints["updateWorkflow"]["response"]
      >(this.BASE_PATH, {
        body: request,
      });

      if (!response.success) {
        throw new Error("Failed to update workflow");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to update workflow:", error);
      throw new Error(getErrorMessage(error));
    }
  }
}
