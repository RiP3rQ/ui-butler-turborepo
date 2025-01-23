"use server";

import {
  type ExecutionsEndpoints,
  type WorkflowsEndpoints,
} from "@shared/types";

import { ExecutionsService } from "@/actions/executions/executions-service";

/**
 * Approves or rejects pending changes
 */
export async function approvePendingChanges(
  request: Readonly<ExecutionsEndpoints["approveChanges"]["request"]>,
): Promise<void> {
  return ExecutionsService.approvePendingChanges(request);
}

/**
 * Fetches pending changes for an execution
 */
export async function getPendingChanges(
  request: Readonly<ExecutionsEndpoints["getPendingChanges"]["request"]>,
): Promise<ExecutionsEndpoints["getPendingChanges"]["response"]> {
  return ExecutionsService.getPendingChanges(request);
}

/**
 * Runs a workflow
 */
export async function runWorkflow(
  request: Readonly<WorkflowsEndpoints["runWorkflow"]["request"]>,
): Promise<WorkflowsEndpoints["runWorkflow"]["response"]> {
  return ExecutionsService.runWorkflow(request);
}
