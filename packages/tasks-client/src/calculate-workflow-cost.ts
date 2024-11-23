import type { AppNode } from "@repo/types";
import { ClientTaskRegister } from "./register";

export function calculateWorkflowCost(nodes: AppNode[]): number {
  return nodes.reduce((total, node) => {
    return total + ClientTaskRegister[node.data.type].credits;
  }, 0);
}
