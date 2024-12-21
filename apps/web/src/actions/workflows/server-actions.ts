"use server";

import {
  type ExecutionPhase,
  type WorkflowExecution,
  type WorkflowExecutionWithPhases,
  type WorkflowType,
} from "@repo/types";
import {
  type CreateWorkflowSchemaType,
  type DuplicateWorkflowSchemaType,
  publishWorkflowSchema,
  runWorkflowSchema,
  updateWorkflowSchema,
  validateWorkflowInput,
} from "@/schemas/workflow";
import { WorkflowService } from "@/actions/workflows/projects-service";
import {
  type GetExecutionDetailsRequest,
  type GetHistoricExecutionsRequest,
  type GetPhaseDetailsRequest,
  type GetWorkflowRequest,
  type PublishWorkflowRequest,
  type RunWorkflowRequest,
  type UpdateWorkflowRequest,
} from "@/actions/workflows/types";

export async function createWorkflow(
  form: Readonly<CreateWorkflowSchemaType>,
): Promise<WorkflowType> {
  const validatedForm = await validateWorkflowInput(form);
  return WorkflowService.createWorkflow(validatedForm);
}

export async function deleteWorkflow(
  workflowId: number,
): Promise<WorkflowType> {
  return WorkflowService.deleteWorkflow(workflowId);
}

export async function duplicateWorkflow(
  form: Readonly<DuplicateWorkflowSchemaType>,
): Promise<WorkflowType> {
  return WorkflowService.duplicateWorkflow(form);
}

export async function getHistoricWorkflowExecutions(
  request: Readonly<GetHistoricExecutionsRequest>,
): Promise<WorkflowExecution[]> {
  return WorkflowService.getHistoricExecutions(request);
}

export async function getWorkflowByIdFunction(
  request: Readonly<GetWorkflowRequest>,
): Promise<WorkflowType> {
  return WorkflowService.getWorkflowById(request);
}

export async function getWorkflowExecutionWithPhasesDetailsFunction(
  request: Readonly<GetExecutionDetailsRequest>,
): Promise<WorkflowExecutionWithPhases> {
  return WorkflowService.getExecutionDetails(request);
}

export async function getWorkflowPhaseDetailsFunction(
  request: Readonly<GetPhaseDetailsRequest>,
): Promise<ExecutionPhase> {
  return WorkflowService.getPhaseDetails(request);
}

export async function getUserWorkflows(): Promise<WorkflowType[]> {
  return WorkflowService.getUserWorkflows();
}

export async function publishWorkflowFunction(
  request: Readonly<PublishWorkflowRequest>,
): Promise<WorkflowType> {
  await publishWorkflowSchema.parseAsync(request);
  return WorkflowService.publishWorkflow(request);
}

export async function runWorkflowFunction(
  request: Readonly<RunWorkflowRequest>,
): Promise<{ url: string }> {
  await runWorkflowSchema.parseAsync(request);
  return WorkflowService.runWorkflow(request);
}

export async function unpublishWorkflowFunction(
  workflowId: number,
): Promise<void> {
  return WorkflowService.unpublishWorkflow(workflowId);
}

export async function updateWorkflowByIdFunction(
  request: Readonly<UpdateWorkflowRequest>,
): Promise<WorkflowType> {
  await updateWorkflowSchema.parseAsync(request);
  return WorkflowService.updateWorkflow(request);
}
