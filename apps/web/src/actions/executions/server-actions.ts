"use server";

import type { ApproveChangesRequest } from "@repo/types";
import {
  type ApprovePendingChangesRequest,
  type GetPendingChangesRequest,
  type RunWorkflowRequest,
  type WorkflowRunResponse,
} from "@/actions/executions/types";
import { ExecutionsService } from "@/actions/executions/executions-service";

/**
 * Approves or rejects pending changes
 */
export async function approvePendingChanges(
  request: Readonly<ApprovePendingChangesRequest>,
): Promise<void> {
  return ExecutionsService.approvePendingChanges(request);
}

/**
 * Fetches pending changes for an execution
 */
export async function getPendingChanges(
  request: Readonly<GetPendingChangesRequest>,
): Promise<ApproveChangesRequest> {
  return ExecutionsService.getPendingChanges(request);
}

/**
 * Runs a workflow
 */
export async function runWorkflow(
  request: Readonly<RunWorkflowRequest>,
): Promise<WorkflowRunResponse> {
  return ExecutionsService.runWorkflow(request);
}
