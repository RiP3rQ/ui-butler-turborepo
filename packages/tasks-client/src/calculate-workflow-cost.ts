import type { AppNode } from "@repo/types";
import { ClientTaskRegister } from "./register";

export function calculateWorkflowCost(nodes: AppNode[]): number {
  return nodes.reduce((acc, node) => {
    return (acc += ClientTaskRegister[node.data.type].credits);
  }, 0);
}
