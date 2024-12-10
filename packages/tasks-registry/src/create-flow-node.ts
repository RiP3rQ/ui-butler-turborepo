import type { AppNode, TaskType } from "@repo/types";

export function createFlowNodeFunction(
  nodeType: TaskType,
  position: { x: number; y: number } = { x: 0, y: 0 },
): AppNode {
  return {
    id: crypto.randomUUID(),
    type: "FlowScrapeNode",
    dragHandle: ".drag-handle",
    data: {
      type: nodeType,
      inputs: {},
      outputs: {},
    },
    position,
  };
}
