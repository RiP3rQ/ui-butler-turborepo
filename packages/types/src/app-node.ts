import { type Edge, type Node } from "@xyflow/react";
import { type TaskParam, type TaskType } from "./task";

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

export interface AppNodeMissingInputs {
  nodeId: string;
  inputs: string[];
}

export type AppEdge = Edge;

export interface ServerSaveEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
