import { ServerTaskRegister } from '@repo/tasks-registry';
import {
  AppNode,
  Environment,
  ServerSaveEdge,
  TaskParamType,
} from '@repo/types';

export function setupPhaseEnvironment(
  node: AppNode,
  environment: Environment,
  edges: ServerSaveEdge[],
) {
  if (!node || !environment || !edges) {
    throw new Error('Node, environment or edges not found');
  }

  environment.phases[node.id] = {
    inputs: {},
    outputs: {},
  };

  const inputsDefinition = ServerTaskRegister[node.data.type].inputs;
  for (const input of inputsDefinition) {
    // if type is CODE_INSTANCE, skip
    if (input.type === TaskParamType.CODE_INSTANCE) {
      continue;
    }
    const inputValue = node.data.inputs[input.name];
    if (inputValue) {
      // Assign input value to the environment
      environment.phases[node.id].inputs[input.name] = inputValue;
      continue;
    }

    // Get input value from outputs in the environment using edges
    const connectedEdge = edges.find(
      (edge) => edge.target === node.id && edge.targetHandle === input.name,
    );
    if (
      !connectedEdge ||
      !connectedEdge.sourceHandle || //Maybe this shouldn't be checked
      !connectedEdge.source //Maybe this shouldn't be checked
    ) {
      console.error('MISSING EDGE FOR INPUT', input.name);
      continue;
    }

    const outputValue =
      environment.phases[connectedEdge.source].outputs[
        connectedEdge.sourceHandle
      ];
    if (!outputValue) {
      console.error('MISSING OUTPUT VALUE FOR INPUT', input.name);
      continue;
    }

    // Assign output value to the environment
    environment.phases[node.id].inputs[input.name] = outputValue;
  }
}
