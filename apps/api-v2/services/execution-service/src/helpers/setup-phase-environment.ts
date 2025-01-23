import { ServerTaskRegister } from '@shared/tasks-registry';
import {
  type AppNode,
  type Environment,
  type ServerSaveEdge,
  TaskParamType,
} from '@shared/types';

export function setupPhaseEnvironment(
  node: AppNode,
  environment: Environment,
  edges: ServerSaveEdge[],
) {
  // Initialize phase environment
  environment.phases[node.id] = {
    temp: {},
    inputs: {},
    outputs: {},
  };

  const inputsDefinition = ServerTaskRegister[node.data.type].inputs;
  for (const input of inputsDefinition) {
    // if type is CODE_INSTANCE, skip
    if (input.type === TaskParamType.CODE_INSTANCE) {
      continue;
    }

    // Ensure phase exists
    if (!environment.phases[node.id]) {
      environment.phases[node.id] = {
        temp: {},
        inputs: {},
        outputs: {},
      };
    }

    const inputValue = node.data.inputs[input.name];
    if (inputValue) {
      environment.phases[node.id]!.inputs[input.name] = inputValue;
      continue;
    }

    // Get input value from outputs in the environment using edges
    const connectedEdge = edges.find(
      (edge) => edge.target === node.id && edge.targetHandle === input.name,
    );

    if (!connectedEdge?.source || !connectedEdge.sourceHandle) {
      console.error('MISSING EDGE FOR INPUT', input.name);
      continue;
    }

    const outputValue =
      environment.phases[connectedEdge.source]?.outputs[
        connectedEdge.sourceHandle
      ];
    if (!outputValue) {
      console.error('MISSING OUTPUT VALUE FOR INPUT', input.name);
      continue;
    }

    // Assign output value to the environment
    environment.phases[node.id]!.inputs[input.name] = outputValue;
  }
}
