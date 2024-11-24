import type {
  AppNode,
  AppNodeMissingInputs,
  WorkflowExecutionPlan,
  WorkflowExecutionPlanError,
  WorkflowExecutionPlanPhase,
} from "@repo/types";
import { FlowToExecutionPlanValidationType } from "@repo/types";
import type { Edge } from "@xyflow/react";
import { ClientTaskRegister } from "./register";

interface FlowToExecutionPlanType {
  executionPlan?: WorkflowExecutionPlan;
  error?: WorkflowExecutionPlanError;
}

export function parseFlowToExecutionPlan(
  nodes: AppNode[],
  edges: Edge[],
): FlowToExecutionPlanType {
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

  const planned = new Set<string>();
  const inputsWithErrors: AppNodeMissingInputs[] = [];

  // validate the entry point
  const invalidInputs = getInvalidInputs(entryPoint, edges, planned);
  if (invalidInputs.length > 0) {
    inputsWithErrors.push({
      nodeId: entryPoint.id || "",
      inputs: invalidInputs,
    });
  }

  // First phase-phase-executors is always the entry point
  const executionPlan: WorkflowExecutionPlan = [
    {
      phase: 1,
      nodes: [entryPoint],
    },
  ];
  planned.add(entryPoint.id);

  // Loop through the nodes and edges to create the execution plan
  for (
    let phase = 2;
    phase <= nodes.length && planned.size < nodes.length;
    phase++
  ) {
    const nextPhase: WorkflowExecutionPlanPhase = {
      phase,
      nodes: [],
    };
    // visit all nodes that are connected to the previous phase-phase-executors
    for (const currentNode of nodes) {
      if (planned.has(currentNode.id)) continue;

      const invalidInputsInner = getInvalidInputs(currentNode, edges, planned);
      if (invalidInputsInner.length > 0) {
        const incomers = getIncomers(currentNode, nodes, edges);
        if (incomers.every((incomer) => planned.has(incomer.id))) {
          // If all incoming incomers/edges are planned and there are still invalid inputs
          // this means that this particular node has INVALID input
          // which means that the workflow is invalid
          console.error(
            "Invalid workflow detected",
            currentNode.id,
            invalidInputsInner,
          );
          // Save the invalid inputs
          inputsWithErrors.push({
            nodeId: currentNode.id,
            inputs: invalidInputsInner,
          });
        } else {
          // Let's skip this node for now
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
  edges: Edge[],
  planned: Set<string>,
): string[] {
  const invalidInputs: string[] = [];
  const inputs = ClientTaskRegister[node.data.type].inputs;
  for (const input of inputs) {
    const inputValue = node.data.inputs[input.name];
    const inputValueProvided = (inputValue?.length ?? 0) > 0;

    if (inputValueProvided) {
      // If the input value is provided, then it's valid
      continue;
    }

    // If the input value is not provided, then we need to check
    // if there is an output linked to the current input

    const incomingEdges = edges.filter((edge) => edge.target === node.id);

    const inputLinkedByOutput = incomingEdges.find(
      (edge) => edge.targetHandle === input.name,
    );

    const requiredInputProvidedByVisitedOutput =
      input.required && planned.has(inputLinkedByOutput?.source ?? "");

    if (requiredInputProvidedByVisitedOutput) {
      // the input is required and we have a valid value for it
      // provided by a task that is already planned
      continue;
    } else if (!input.required) {
      // the input is not required but there is an output linked to it
      // then we need to be sure that the output is planned
      if (planned.has(inputLinkedByOutput?.source ?? "")) {
        // the output is providing a value for the input: so the input is valid
        continue;
      }
    }

    // If we reach this point, then the input is invalid
    invalidInputs.push(input.name);
  }

  return invalidInputs;
}

// Custom getIncomers function for usability on backend
function getIncomers(
  node: AppNode,
  nodes: AppNode[],
  edges: Edge[],
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

  return nodes.filter((item) => incomerIds.has(item.id));
}
