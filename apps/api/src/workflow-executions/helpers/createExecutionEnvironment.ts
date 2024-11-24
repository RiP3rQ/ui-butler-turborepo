import {
  AppNode,
  Environment,
  ExecutionEnvironment,
  LogCollector,
} from '@repo/types';

export function createExecutionEnvironment(
  node: AppNode,
  environment: Environment,
  logCollector: LogCollector,
): ExecutionEnvironment<any> {
  return {
    getInput: (name: string) => environment.phases[node.id]?.inputs[name] || '',
    setOutput: (name: string, value: string) => {
      environment.phases[node.id].outputs[name] = value;
    },

    getCode: () => environment.code,
    setCode: (code: string) => {
      environment.code = code;
    },

    log: logCollector,
  };
}
