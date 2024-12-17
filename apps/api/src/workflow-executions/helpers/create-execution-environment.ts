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

    getStartingCode(): string {
      return environment.startingCode;
    },
    setStartingCode(code: string): void {
      environment.startingCode = code;
    },

    getTemp(name: string): string {
      return environment.phases[node.id]?.temp[name] || '';
    },
    setTemp(name: string, value: string): void {
      environment.phases[node.id].temp[name] = value;
    },

    getCode: () => environment.code,
    setCode: (code: string) => {
      environment.code = code;
    },

    getComponentId(): number {
      return environment.componentId;
    },

    log: logCollector,
  };
}
