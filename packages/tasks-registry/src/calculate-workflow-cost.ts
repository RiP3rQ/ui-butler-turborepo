import type { AppNode } from "@shared/types";
import { ClientTaskRegister } from "./tasks/register";

export function calculateWorkflowCost(nodes: AppNode[]): number {
  return nodes.reduce((total, node) => {
    return total + ClientTaskRegister[node.data.type].credits;
  }, 0);
}
