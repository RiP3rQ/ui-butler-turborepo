import { Edge, Node } from "@xyflow/react";
import { TaskParam, TaskType } from "./task";

export interface AppNodeData {
  type: TaskType;
  inputs: Record<string, string>;
  outputs: Record<string, string>;
  [key: string]: unknown;
}

export interface AppNode extends Node {
  id: string;
  data: AppNodeData;
  type: string;
  dragHandle: string;
  position: { x: number; y: number };
}

export interface ParamProps {
  param: TaskParam;
  value: string;
  updateNodeParamValue: (value: string) => void;
  disabled: boolean;
}

export type AppNodeMissingInputs = {
  nodeId: string;
  inputs: string[];
};

export interface AppEdge extends Edge {}

export type ServerSaveEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
};
