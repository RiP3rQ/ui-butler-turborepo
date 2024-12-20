import {
  type ExecutionPhase,
  type WorkflowExecution,
  type WorkflowExecutionWithPhases,
  type WorkflowType,
} from "@repo/types";
import { ApiClient } from "@/lib/api-client";
import {
  type CreateWorkflowSchemaType,
  type DuplicateWorkflowSchemaType,
} from "@/schemas/workflow";
import {
  type GetExecutionDetailsRequest,
  type GetHistoricExecutionsRequest,
  type GetPhaseDetailsRequest,
  type GetWorkflowRequest,
  type PublishWorkflowRequest,
  type RunWorkflowRequest,
  type UpdateWorkflowRequest,
} from "@/actions/workflows/types";

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
  ): Promise<WorkflowType> {
    try {
      const { data } = await ApiClient.post<
        CreateWorkflowSchemaType,
        WorkflowType
      >(this.BASE_PATH, { body: form });
      return data;
    } catch (error) {
      throw new Error("Failed to create workflow");
    }
  }

  /**
   * Deletes a workflow
   */
  static async deleteWorkflow(workflowId: number): Promise<WorkflowType> {
    try {
      const { data } = await ApiClient.delete<WorkflowType>(this.BASE_PATH, {
        params: { workflowId: workflowId.toString() },
      });
      return data;
    } catch (error) {
      throw new Error("Failed to delete workflow");
    }
  }

  /**
   * Duplicates a workflow
   */
  static async duplicateWorkflow(
    form: Readonly<DuplicateWorkflowSchemaType>,
  ): Promise<WorkflowType> {
    try {
      const { data } = await ApiClient.post<
        DuplicateWorkflowSchemaType,
        WorkflowType
      >(`${this.BASE_PATH}/duplicate-workflow`, { body: form });
      return data;
    } catch (error) {
      throw new Error("Failed to duplicate workflow");
    }
  }

  /**
   * Fetches historic workflow executions
   */
  static async getHistoricExecutions({
    workflowId,
  }: Readonly<GetHistoricExecutionsRequest>): Promise<WorkflowExecution[]> {
    try {
      const { data } = await ApiClient.get<WorkflowExecution[]>(
        `${this.BASE_PATH}/historic`,
        {
          params: { workflowId: workflowId.toString() },
        },
      );
      return data;
    } catch (error) {
      throw new Error("Failed to fetch workflow history");
    }
  }

  /**
   * Fetches workflow by ID
   */
  static async getWorkflowById({
    workflowId,
  }: Readonly<GetWorkflowRequest>): Promise<WorkflowType> {
    try {
      if (!workflowId) {
        throw new Error("Workflow ID is required");
      }

      const { data } = await ApiClient.get<WorkflowType>(
        `${this.BASE_PATH}/get-by-id/${workflowId}`,
      );
      return data;
    } catch (error) {
      throw new Error("Failed to fetch workflow");
    }
  }

  /**
   * Fetches workflow execution details
   */
  static async getExecutionDetails({
    executionId,
  }: Readonly<GetExecutionDetailsRequest>): Promise<WorkflowExecutionWithPhases> {
    try {
      const { data } = await ApiClient.get<WorkflowExecutionWithPhases>(
        `${this.BASE_PATH}/executions`,
        {
          params: { executionId },
        },
      );
      return data;
    } catch (error) {
      throw new Error("Failed to fetch execution details");
    }
  }

  /**
   * Fetches workflow phase details
   */
  static async getPhaseDetails({
    phaseId,
  }: Readonly<GetPhaseDetailsRequest>): Promise<ExecutionPhase> {
    try {
      const { data } = await ApiClient.get<ExecutionPhase>(
        `${this.BASE_PATH}/phases`,
        {
          params: { phaseId: phaseId.toString() },
        },
      );
      return data;
    } catch (error) {
      throw new Error("Failed to fetch phase details");
    }
  }

  /**
   * Fetches all user workflows
   */
  static async getUserWorkflows(): Promise<WorkflowType[]> {
    try {
      const { data } = await ApiClient.get<WorkflowType[]>(this.BASE_PATH);
      return data;
    } catch (error) {
      throw new Error("Failed to fetch user workflows");
    }
  }

  /**
   * Publishes a workflow
   */
  static async publishWorkflow({
    workflowId,
    flowDefinition,
  }: Readonly<PublishWorkflowRequest>): Promise<WorkflowType> {
    try {
      const { data } = await ApiClient.post<
        PublishWorkflowRequest,
        WorkflowType
      >(`${this.BASE_PATH}/publish-workflow`, {
        body: { workflowId, flowDefinition },
      });
      return data;
    } catch (error) {
      throw new Error("Failed to publish workflow");
    }
  }

  /**
   * Runs a workflow
   */
  static async runWorkflow(
    request: Readonly<RunWorkflowRequest>,
  ): Promise<{ url: string }> {
    try {
      const { data } = await ApiClient.post<
        RunWorkflowRequest,
        { url: string }
      >(`${this.BASE_PATH}/run-workflow`, {
        body: request,
      });
      return data;
    } catch (error) {
      throw new Error("Failed to run workflow");
    }
  }

  /**
   * Unpublishes a workflow
   */
  static async unpublishWorkflow(workflowId: number): Promise<void> {
    try {
      await ApiClient.get(`${this.BASE_PATH}/unpublish-workflow`, {
        params: { workflowId: workflowId.toString() },
      });
    } catch (error) {
      throw new Error("Failed to unpublish workflow");
    }
  }

  /**
   * Updates a workflow
   */
  static async updateWorkflow({
    workflowId,
    definition,
  }: Readonly<UpdateWorkflowRequest>): Promise<WorkflowType> {
    try {
      const { data } = await ApiClient.patch<
        UpdateWorkflowRequest,
        WorkflowType
      >(this.BASE_PATH, {
        body: { workflowId, definition },
      });
      return data;
    } catch (error) {
      throw new Error("Failed to update workflow");
    }
  }
}
