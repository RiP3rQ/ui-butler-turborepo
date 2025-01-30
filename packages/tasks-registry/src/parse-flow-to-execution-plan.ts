import type {
  AppNode,
  WorkflowExecutionPlan,
  WorkflowExecutionPlanError,
} from "@shared/types";
import { FlowToExecutionPlanValidationType } from "@shared/types";
import type { Edge } from "@xyflow/react";
import { ClientTaskRegister } from "./tasks/register";

interface FlowToExecutionPlanType {
  executionPlan?: WorkflowExecutionPlan;
  error?: WorkflowExecutionPlanError;
}

export function parseFlowToExecutionPlan(
  nodes: AppNode[],
  edges: Edge[],
): FlowToExecutionPlanType {
  // Find entry point
  const entryPoint = nodes.find(
    (node) => ClientTaskRegister[node.data.type].isEntryPoint,
  );

  if (!entryPoint) {
    return {
      error: { type: FlowToExecutionPlanValidationType.NO_ENTRY_POINT },
    };
  }

  const planned = new Set<string>();
  const dependencyMap = createDependencyMap(edges);
  const levelMap = createLevelMap(nodes, dependencyMap);

  // Start with entry point
  const executionPlan: WorkflowExecutionPlan = [
    { phase: 1, nodes: [entryPoint] },
  ];
  planned.add(entryPoint.id);

  // Group nodes by their dependency level
  const nodesByLevel = new Map<number, AppNode[]>();
  nodes.forEach((node) => {
    if (node.id === entryPoint.id) return;
    const level = levelMap.get(node.id) || 0;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)?.push(node);
  });

  // Create phases based on levels
  Array.from(nodesByLevel.keys())
    .sort((a, b) => a - b)
    .forEach((level) => {
      const nodesInLevel = nodesByLevel.get(level) || [];
      const readyNodes = nodesInLevel.filter((node) =>
        Array.from(dependencyMap.get(node.id) || []).every((depId) =>
          planned.has(depId),
        ),
      );

      if (readyNodes.length > 0) {
        executionPlan.push({
          phase: executionPlan.length + 1,
          nodes: readyNodes,
        });
        readyNodes.forEach((node) => planned.add(node.id));
      }
    });

  return { executionPlan };
}

function createDependencyMap(edges: Edge[]): Map<string, Set<string>> {
  const dependencyMap = new Map<string, Set<string>>();

  edges.forEach((edge) => {
    if (!dependencyMap.has(edge.target)) {
      dependencyMap.set(edge.target, new Set());
    }
    dependencyMap.get(edge.target)?.add(edge.source);
  });

  return dependencyMap;
}

function createLevelMap(
  nodes: AppNode[],
  dependencyMap: Map<string, Set<string>>,
): Map<string, number> {
  const levelMap = new Map<string, number>();
  const visited = new Set<string>();

  function calculateLevel(nodeId: string): number {
    if (visited.has(nodeId)) return levelMap.get(nodeId) || 0;
    visited.add(nodeId);

    const dependencies = dependencyMap.get(nodeId) || new Set();
    if (dependencies.size === 0) return 0;

    const maxDepLevel = Math.max(
      ...Array.from(dependencies).map(calculateLevel),
    );
    const level = maxDepLevel + 1;
    levelMap.set(nodeId, level);
    return level;
  }

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      calculateLevel(node.id);
    }
  });

  return levelMap;
}
