import type { AppNode } from "@repo/types/src/appNode";
import { TaskRegistry } from "@repo/ui/lib/workflow/task/registery";

export function calculateWorkflowCost(nodes: AppNode[]): number {
  return nodes.reduce((acc, node) => {
    return (acc += TaskRegistry[node.data.type].credits);
  }, 0);
}
