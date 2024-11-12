import { WorkflowTask } from './workflow';
import { LogCollector } from './logCollector';

export type Environment = {
  // phases with phaseId as key
  phases: Record<
    string,
    {
      inputs: Record<string, string>;
      outputs: Record<string, string>;
    }
  >;
};

export type ExecutionEnvironment<T extends WorkflowTask> = {
  getInput(name: T["inputs"][number]["name"]): string;
  setOutput(name: T["outputs"][number]["name"], value: string): void;

  log: LogCollector;
};
