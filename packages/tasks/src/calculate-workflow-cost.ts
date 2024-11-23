import type { AppNode } from "@repo/types";
import { ServerTaskRegister } from "./register";

export function calculateWorkflowCost(nodes: AppNode[]): number {
  return nodes.reduce((acc, node) => {
    return (acc += ServerTaskRegister[node.data.type].credits);
  }, 0);
}
