import {
  AppNode,
  AppNodeMissingInputs,
  FlowToExecutionPlanValidationType,
  ServerSaveEdge,
  WorkflowExecutionPlan,
  WorkflowExecutionPlanError,
  WorkflowExecutionPlanPhase,
} from '@repo/types';
import { ServerTaskRegistery } from '@repo/tasks';

type FlowToExecutionPlanType = {
  executionPlan?: WorkflowExecutionPlan;
  error?: WorkflowExecutionPlanError;
};

export function parseFlowToExecutionPlan(
  nodes: AppNode[],
  edges: ServerSaveEdge[],
): FlowToExecutionPlanType {
  const entryPoint = nodes.find(
    (node) => ServerTaskRegistery[node.data.type]?.isEntryPoint,
  );

  if (!entryPoint) {
    return {
      error: {
        type: FlowToExecutionPlanValidationType.NO_ENTRY_POINT,
      },
    };
  }

  const planned = new Set<string>();
  const inputsWithErrors: AppNodeMissingInputs[] = [];

  const invalidInputs = getInvalidInputs(entryPoint, edges, planned);
  if (invalidInputs.length > 0) {
    inputsWithErrors.push({
      nodeId: entryPoint.id,
      inputs: invalidInputs,
    });
  }

  const executionPlan: WorkflowExecutionPlan = [
    {
      phase: 1,
      nodes: [entryPoint],
    },
  ];
  planned.add(entryPoint.id);

  for (
    let phase = 2;
    phase <= nodes.length && planned.size < nodes.length;
    phase++
  ) {
    const nextPhase: WorkflowExecutionPlanPhase = {
      phase,
      nodes: [],
    };

    for (const currentNode of nodes) {
      if (planned.has(currentNode.id)) continue;

      const invalidInputs = getInvalidInputs(currentNode, edges, planned);
      if (invalidInputs.length > 0) {
        const incomers = getIncomers(currentNode, nodes, edges);
        if (incomers.every((incomer) => planned.has(incomer.id))) {
          inputsWithErrors.push({
            nodeId: currentNode.id,
            inputs: invalidInputs,
          });
        } else {
          continue;
        }
      }

      nextPhase.nodes.push(currentNode);
    }

    for (const node of nextPhase.nodes) {
      planned.add(node.id);
    }
    executionPlan.push(nextPhase);
  }

  if (inputsWithErrors.length > 0) {
    return {
      error: {
        type: FlowToExecutionPlanValidationType.INVALID_INPUTS,
        invalidElements: inputsWithErrors,
      },
    };
  }

  return {
    executionPlan,
  };
}

function getInvalidInputs(
  node: AppNode,
  edges: ServerSaveEdge[],
  planned: Set<string>,
): string[] {
  const invalidInputs: string[] = [];
  const taskConfig = ServerTaskRegistery[node.data.type];

  if (!taskConfig) {
    return ['INVALID_TASK_TYPE'];
  }

  for (const input of taskConfig.inputs) {
    const inputValue = node.data.inputs[input.name];
    const inputValueProvided = inputValue?.length > 0;

    if (inputValueProvided) {
      continue;
    }

    const incomingEdges = edges.filter((edge) => edge.target === node.id);
    const inputLinkedByOutput = incomingEdges.find(
      (edge) => edge.targetHandle === input.name,
    );

    const requiredInputProvidedByVisitedOutput =
      input.required &&
      inputLinkedByOutput &&
      planned.has(inputLinkedByOutput.source);

    if (requiredInputProvidedByVisitedOutput) {
      continue;
    } else if (!input.required) {
      if (!inputLinkedByOutput) {
        continue;
      }
      if (inputLinkedByOutput && planned.has(inputLinkedByOutput.source)) {
        continue;
      }
    }

    invalidInputs.push(input.name);
  }

  return invalidInputs;
}

function getIncomers(
  node: AppNode,
  nodes: AppNode[],
  edges: ServerSaveEdge[],
): AppNode[] {
  if (!node.id) {
    return [];
  }

  const incomerIds = new Set();
  edges.forEach((edge) => {
    if (edge.target === node.id) {
      incomerIds.add(edge.source);
    }
  });

  return nodes.filter((node) => incomerIds.has(node.id));
}
