import type { AppNode } from '@repo/types/src/appNode';
import { ServerTaskRegistery } from '@repo/tasks';

export function calculateWorkflowCost(nodes: AppNode[]): number {
  return nodes.reduce((acc, node) => {
    return (acc += ServerTaskRegistery[node.data.type].credits);
  }, 0);
}
