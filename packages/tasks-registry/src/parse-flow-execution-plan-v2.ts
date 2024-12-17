import type {
  AppNode,
  AppNodeMissingInputs,
  WorkflowExecutionPlan,
  WorkflowExecutionPlanError,
  WorkflowExecutionPlanPhase,
} from "@repo/types";
import { FlowToExecutionPlanValidationType } from "@repo/types";
import type { Edge } from "@xyflow/react";
import { ClientTaskRegister } from "./tasks/register";

interface FlowToExecutionPlanType {
  executionPlan?: WorkflowExecutionPlan;
  error?: WorkflowExecutionPlanError;
}

/**
 * Parses a React Flow graph into an execution plan that can be executed by the workflow engine.
 * The execution plan is organized in phases, where each phase contains nodes that can be executed concurrently.
 */
export function parseFlowToExecutionPlan2(
  nodes: AppNode[],
  edges: Edge[],
): FlowToExecutionPlanType {
  // Create adjacency maps for faster lookups
  const incomingEdgesMap = createEdgesMap(edges, "target");
  const outgoingEdgesMap = createEdgesMap(edges, "source");

  // Find entry point
  const entryPoint = nodes.find(
    (node) => ClientTaskRegister[node.data.type].isEntryPoint,
  );

  if (!entryPoint) {
    return {
      error: {
        type: FlowToExecutionPlanValidationType.NO_ENTRY_POINT,
      },
    };
  }

  // Track nodes that have been assigned to phases
  const planned = new Set<string>();
  const inputsWithErrors: AppNodeMissingInputs[] = [];

  // Validate entry point
  validateNodeInputs(entryPoint, incomingEdgesMap, planned, inputsWithErrors);

  // Initialize execution plan with entry point
  const executionPlan: WorkflowExecutionPlan = [
    {
      phase: 1,
      nodes: [entryPoint],
    },
  ];
  planned.add(entryPoint.id);

  // Create a map of node dependencies
  const dependencyMap = createDependencyMap(nodes, edges);

  // Create a map of nodes that can be executed concurrently
  const concurrentGroups = identifyConcurrentGroups(nodes, dependencyMap);

  let currentPhase = 2;
  while (planned.size < nodes.length) {
    const nodesReadyForExecution = findNodesReadyForExecution(
      nodes,
      planned,
      dependencyMap,
      concurrentGroups,
    );

    if (nodesReadyForExecution.length === 0) break;

    const phase: WorkflowExecutionPlanPhase = {
      phase: currentPhase,
      nodes: nodesReadyForExecution,
    };

    // Validate inputs for all nodes in the phase
    for (const node of nodesReadyForExecution) {
      validateNodeInputs(node, incomingEdgesMap, planned, inputsWithErrors);
      planned.add(node.id);
    }

    executionPlan.push(phase);
    currentPhase++;
  }

  if (inputsWithErrors.length > 0) {
    return {
      error: {
        type: FlowToExecutionPlanValidationType.INVALID_INPUTS,
        invalidElements: inputsWithErrors,
      },
    };
  }

  return { executionPlan };
}

/**
 * Creates a map of edges for faster lookup
 * Direction can be either 'source' or 'target'
 */
function createEdgesMap(
  edges: Edge[],
  direction: "source" | "target",
): Map<string, Edge[]> {
  const edgesMap = new Map<string, Edge[]>();

  edges.forEach((edge) => {
    const key = edge[direction];
    if (!edgesMap.has(key)) {
      edgesMap.set(key, []);
    }
    edgesMap.get(key)!.push(edge);
  });

  return edgesMap;
}

/**
 * Creates a map of dependencies for each node
 * Returns a map where key is nodeId and value is array of dependent node IDs
 */
function createDependencyMap(
  nodes: AppNode[],
  edges: Edge[],
): Map<string, Set<string>> {
  const dependencyMap = new Map<string, Set<string>>();

  nodes.forEach((node) => {
    dependencyMap.set(node.id, new Set());
  });

  edges.forEach((edge) => {
    const dependent = dependencyMap.get(edge.target);
    if (dependent) {
      dependent.add(edge.source);
    }
  });

  return dependencyMap;
}

/**
 * Identifies groups of nodes that can be executed concurrently
 * Returns a map where key is nodeId and value is the group ID
 */
function identifyConcurrentGroups(
  nodes: AppNode[],
  dependencyMap: Map<string, Set<string>>,
): Map<string, number> {
  const groupMap = new Map<string, number>();
  let currentGroup = 0;

  nodes.forEach((node) => {
    if (!groupMap.has(node.id)) {
      const dependencies = dependencyMap.get(node.id);
      const dependents = findDependentNodes(node.id, dependencyMap);

      // If nodes share no dependencies and dependents, they can be in the same group
      const canBeGrouped = Array.from(groupMap.entries())
        .filter(([_, group]) => group === currentGroup)
        .every(([otherId]) => {
          const otherDeps = dependencyMap.get(otherId);
          const otherDependents = findDependentNodes(otherId, dependencyMap);
          return (
            !hasIntersection(dependencies!, otherDeps!) &&
            !hasIntersection(dependents, otherDependents)
          );
        });

      if (canBeGrouped) {
        groupMap.set(node.id, currentGroup);
      } else {
        currentGroup++;
        groupMap.set(node.id, currentGroup);
      }
    }
  });

  return groupMap;
}

/**
 * Finds all nodes that are ready to be executed based on their dependencies
 */
function findNodesReadyForExecution(
  nodes: AppNode[],
  planned: Set<string>,
  dependencyMap: Map<string, Set<string>>,
  concurrentGroups: Map<string, number>,
): AppNode[] {
  const readyNodes: AppNode[] = [];
  const currentGroup = new Set<number>();

  nodes.forEach((node) => {
    if (planned.has(node.id)) return;

    const dependencies = dependencyMap.get(node.id);
    if (!dependencies) return;

    // Check if all dependencies are planned
    const allDependenciesPlanned = Array.from(dependencies).every((depId) =>
      planned.has(depId),
    );

    if (allDependenciesPlanned) {
      const nodeGroup = concurrentGroups.get(node.id);
      if (nodeGroup !== undefined && !currentGroup.has(nodeGroup)) {
        currentGroup.add(nodeGroup);
        readyNodes.push(node);
      }
    }
  });

  return readyNodes;
}

/**
 * Validates and returns invalid inputs for a node
 * @param node - The node to validate inputs for
 * @param incomingEdgesMap - Map of incoming edges for quick lookup
 * @param planned - Set of nodes that have been planned
 * @returns Array of invalid input names
 */
function getInvalidInputs(
  node: AppNode,
  incomingEdgesMap: Map<string, Edge[]>,
  planned: Set<string>,
): string[] {
  const invalidInputs: string[] = [];
  const taskDefinition = ClientTaskRegister[node.data.type];

  if (!taskDefinition) {
    console.error(`No task definition found for type: ${node.data.type}`);
    return invalidInputs;
  }

  // Get incoming edges for this node
  const nodeIncomingEdges = incomingEdgesMap.get(node.id) || [];

  // Create a map of input handles to their providing edges for quick lookup
  const inputEdgesMap = new Map<string, Edge>();
  nodeIncomingEdges.forEach((edge) => {
    if (edge.targetHandle) {
      inputEdgesMap.set(edge.targetHandle, edge);
    }
  });

  // Validate each required input
  for (const input of taskDefinition.inputs) {
    const inputValue = node.data.inputs[input.name];
    const hasProvidedValue = Boolean(inputValue?.length);

    // If input value is provided directly, it's valid
    if (hasProvidedValue) {
      continue;
    }

    const incomingEdge = inputEdgesMap.get(input.name);

    // Check if this input is connected to an output from a previous node
    if (incomingEdge) {
      const sourceNodePlanned = planned.has(incomingEdge.source);

      if (input.required && !sourceNodePlanned) {
        // Required input is connected but source node hasn't been executed
        invalidInputs.push(input.name);
      }
    } else if (input.required) {
      // Required input has no value and no connection
      invalidInputs.push(input.name);
    }
  }

  return invalidInputs;
}

/**
 * Validates inputs for a node and collects any errors
 */
function validateNodeInputs(
  node: AppNode,
  incomingEdgesMap: Map<string, Edge[]>,
  planned: Set<string>,
  inputsWithErrors: AppNodeMissingInputs[],
): void {
  const invalidInputs = getInvalidInputs(node, incomingEdgesMap, planned);

  if (invalidInputs.length > 0) {
    inputsWithErrors.push({
      nodeId: node.id,
      inputs: invalidInputs,
    });
  }
}

// Helper functions
function findDependentNodes(
  nodeId: string,
  dependencyMap: Map<string, Set<string>>,
): Set<string> {
  const dependents = new Set<string>();

  dependencyMap.forEach((deps, id) => {
    if (deps.has(nodeId)) {
      dependents.add(id);
    }
  });

  return dependents;
}

function hasIntersection<T>(setA: Set<T>, setB: Set<T>): boolean {
  return Array.from(setA).some((elem) => setB.has(elem));
}
