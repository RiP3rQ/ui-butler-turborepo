"use server";

import { WorkflowService } from "@/actions/workflows/workflows-service";
import {
  type CreateWorkflowSchemaType,
  type DuplicateWorkflowSchemaType,
  publishWorkflowSchema,
  runWorkflowSchema,
  updateWorkflowSchema,
  validateWorkflowInput,
} from "@/schemas/workflow";
import {
  type Workflow,
  type WorkflowsEndpoints,
} from "@shared/types/src/api-client/workflows-endpoints";

/**
 * Creates a new workflow
 */
export async function createWorkflow(
  form: Readonly<CreateWorkflowSchemaType>,
): Promise<Workflow> {
  const validatedForm = await validateWorkflowInput(form);
  return WorkflowService.createWorkflow(validatedForm);
}

/**
 * Deletes a workflow
 */
export async function deleteWorkflow(workflowId: number): Promise<Workflow> {
  return WorkflowService.deleteWorkflow(workflowId);
}

/**
 * Duplicates a workflow
 */
export async function duplicateWorkflow(
  form: Readonly<DuplicateWorkflowSchemaType>,
): Promise<Workflow> {
  return WorkflowService.duplicateWorkflow(form);
}

/**
 * Fetches historic workflow executions
 */
export async function getHistoricWorkflowExecutions(
  request: Readonly<
    WorkflowsEndpoints["getHistoricWorkflowExecutions"]["request"]
  >,
): Promise<WorkflowsEndpoints["getHistoricWorkflowExecutions"]["response"]> {
  return WorkflowService.getHistoricExecutions(request);
}

/**
 * Fetches workflow by ID
 */
export async function getWorkflowByIdFunction(
  request: Readonly<WorkflowsEndpoints["getWorkflowById"]["request"]>,
): Promise<Workflow> {
  return WorkflowService.getWorkflowById(request);
}

/**
 * Fetches workflow execution details
 */
export async function getWorkflowExecutionWithPhasesDetailsFunction(
  request: Readonly<WorkflowsEndpoints["getWorkflowExecutions"]["request"]>,
): Promise<WorkflowsEndpoints["getWorkflowExecutions"]["response"]> {
  return WorkflowService.getExecutionDetails(request);
}

/**
 * Fetches workflow phase details
 */
export async function getWorkflowPhaseDetailsFunction(
  request: Readonly<WorkflowsEndpoints["getWorkflowPhase"]["request"]>,
): Promise<WorkflowsEndpoints["getWorkflowPhase"]["response"]> {
  return WorkflowService.getPhaseDetails(request);
}

/**
 * Fetches all user workflows
 */
export async function getUserWorkflows(): Promise<Workflow[]> {
  return WorkflowService.getUserWorkflows();
}

/**
 * Publishes a workflow
 */
export async function publishWorkflowFunction(
  request: Readonly<WorkflowsEndpoints["publishWorkflow"]["request"]>,
): Promise<Workflow> {
  await publishWorkflowSchema.parseAsync(request);
  return WorkflowService.publishWorkflow(request);
}

/**
 * Runs a workflow
 */
export async function runWorkflowFunction(
  request: Readonly<WorkflowsEndpoints["runWorkflow"]["request"]>,
): Promise<WorkflowsEndpoints["runWorkflow"]["response"]> {
  await runWorkflowSchema.parseAsync(request);
  return WorkflowService.runWorkflow(request);
}

/**
 * Unpublishes a workflow
 */
export async function unpublishWorkflowFunction(
  workflowId: number,
): Promise<void> {
  return WorkflowService.unpublishWorkflow(workflowId);
}

/**
 * Updates a workflow
 */
export async function updateWorkflowByIdFunction(
  request: Readonly<WorkflowsEndpoints["updateWorkflow"]["request"]>,
): Promise<Workflow> {
  await updateWorkflowSchema.parseAsync(request);
  return WorkflowService.updateWorkflow(request);
}
