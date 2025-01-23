import { type LogCollector } from "./log-collector";
import { type TaskParam } from "./tasks";
import { type BaseWorkflowTask } from "./workflow";

export interface Environment {
  workflowExecutionId: number;
  componentId?: number;
  code?: string;
  startingCode?: string;
  tsDocs?: string;
  mdxDocs?: string;
  unitTests?: string;
  e2eTests?: string;
  // phases with phaseId as key
  phases: Record<
    string,
    {
      inputs: Record<string, string>;
      outputs: Record<string, string>;
      temp: Record<string, string>;
    }
  >;
}

export type InputOutputNames<T extends readonly TaskParam[]> =
  T[number]["name"];

export interface ExecutionEnvironment<T extends BaseWorkflowTask> {
  getComponentId: () => number | undefined;

  getStartingCode: () => string;
  setStartingCode: (code: string) => void;

  getCode: () => string | undefined;
  setCode: (code: string) => void;

  getInput: (name: InputOutputNames<T["inputs"]>) => string;
  setOutput: (name: InputOutputNames<T["outputs"]>, value: string) => void;

  getTemp: (name: InputOutputNames<NonNullable<T["temp"]>>) => string;
  setTemp: (
    name: InputOutputNames<NonNullable<T["temp"]>>,
    value: string,
  ) => void;

  // Generated codes
  getTsDocs: () => string;
  setTsDocs: (tsDocs: string) => void;

  getMdxDocs: () => string;
  setMdxDocs: (mdxDocs: string) => void;

  getUnitTests: () => string;
  setUnitTests: (unitTests: string) => void;

  getE2ETests: () => string;
  setE2ETests: (e2eTests: string) => void;

  log: LogCollector;
}
