import { BaseWorkflowTask } from "./workflow";
import { LogCollector } from "./logCollector";
import { TaskParam } from "./task";

export type Environment = {
  code?: string;
  // phases with phaseId as key
  phases: Record<
    string,
    {
      inputs: Record<string, string>;
      outputs: Record<string, string>;
    }
  >;
};

export type InputOutputNames<T extends readonly TaskParam[]> =
  T[number]["name"];

export type ExecutionEnvironment<T extends BaseWorkflowTask> = {
  getInput(name: InputOutputNames<T["inputs"]>): string;
  setOutput(name: InputOutputNames<T["outputs"]>, value: string): void;

  getCode(): string | undefined;
  setCode(code: string): void;

  log: LogCollector;
};
