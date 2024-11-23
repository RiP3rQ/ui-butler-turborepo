import type { TaskType } from "@repo/types/src/task";
import type { AppNode } from "@repo/types/src/appNode";

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
