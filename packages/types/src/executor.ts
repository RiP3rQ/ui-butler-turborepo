import { BaseWorkflowTask } from "./workflow";
import { LogCollector } from "./logCollector";
import { TaskParam } from "./task";

export type Environment = {
  workflowExecutionId: number;
  componentId?: number;
  code?: string;
  startingCode?: string;
  // phases with phaseId as key
  phases: Record<
    string,
    {
      inputs: Record<string, string>;
      outputs: Record<string, string>;
      temp: Record<string, string>;
    }
  >;
};

export type InputOutputNames<T extends readonly TaskParam[]> =
  T[number]["name"];

export type ExecutionEnvironment<T extends BaseWorkflowTask> = {
  getInput(name: InputOutputNames<T["inputs"]>): string;
  setOutput(name: InputOutputNames<T["outputs"]>, value: string): void;

  getTemp(name: InputOutputNames<T["temp"]>): string;
  setTemp(name: InputOutputNames<T["temp"]>, value: string): void;

  getStartingCode(): string;
  setStartingCode(code: string): void;

  getCode(): string | undefined;
  setCode(code: string): void;

  getComponentId(): number | undefined;

  log: LogCollector;
};
