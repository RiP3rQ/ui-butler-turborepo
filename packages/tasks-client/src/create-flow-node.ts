import type { AppNode, TaskType } from "@repo/types";

export function createFlowNodeFunction(
  nodeType: TaskType,
  position?: { x: number; y: number },
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
    position: position || { x: 0, y: 0 },
  };
}
