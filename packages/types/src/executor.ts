import { BaseWorkflowTask } from "./workflow";
import { LogCollector } from "./logCollector";

export type Environment = {
  // phases with phaseId as key
  phases: Record<
    string,
    {
      inputs: Record<string, string>;
      outputs: Record<string, string>;
    }
  >;
  code: string;
};

export type ExecutionEnvironment<T extends BaseWorkflowTask> = {
  getInput(name: T["inputs"][number]["name"]): string;
  setOutput(name: T["outputs"][number]["name"], value: string): void;

  getCode(): string;
  setCode(code: string): void;

  log: LogCollector;
};
