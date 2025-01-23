import {
  type AppNode,
  type Environment,
  type ExecutionEnvironment,
  type LogCollector,
} from '@shared/types';

export function createExecutionEnvironment(
  node: AppNode,
  environment: Environment,
  logCollector: LogCollector,
): ExecutionEnvironment<any> {
  return {
    getComponentId(): number {
      return environment.componentId ?? 0;
    },

    getStartingCode(): string {
      return environment.startingCode ?? '';
    },
    setStartingCode(code: string): void {
      environment.startingCode = code;
    },

    getCode: () => environment.code,
    setCode: (code: string) => {
      environment.code = code;
    },

    getInput: (name: string) => environment.phases[node.id]?.inputs[name] ?? '',
    setOutput: (name: string, value: string) => {
      if (environment.phases[node.id]) {
        environment.phases[node.id]!.outputs[name] = value;
      }
    },

    getTemp(name: string): string {
      return environment.phases[node.id]?.temp[name] ?? '';
    },
    setTemp(name: string, value: string): void {
      if (environment.phases[node.id]) {
        environment.phases[node.id]!.temp[name] = value;
      }
    },

    // Generated codes
    getTsDocs(): string {
      return environment.tsDocs ?? '';
    },
    setTsDocs(tsDocs: string): void {
      environment.tsDocs = tsDocs;
    },
    getMdxDocs(): string {
      return environment.mdxDocs ?? '';
    },
    setMdxDocs(mdxDocs: string): void {
      environment.mdxDocs = mdxDocs;
    },
    getUnitTests(): string {
      return environment.unitTests ?? '';
    },
    setUnitTests(unitTests: string): void {
      environment.unitTests = unitTests;
    },
    getE2ETests(): string {
      return environment.e2eTests ?? '';
    },
    setE2ETests(e2eTests: string): void {
      environment.e2eTests = e2eTests;
    },

    log: logCollector,
  };
}
