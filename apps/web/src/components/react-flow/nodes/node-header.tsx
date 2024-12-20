import type { AppNode, TaskType } from "@repo/types";
import { CoinsIcon, CopyIcon, GripVerticalIcon, TrashIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { useReactFlow } from "@xyflow/react";
import {
  ClientTaskRegister,
  createFlowNodeFunction,
} from "@repo/tasks-registry";
import { type JSX } from "react";

interface NodeHeaderProps {
  taskType: TaskType;
  nodeId: string;
}
function NodeHeader({
  taskType,
  nodeId,
}: Readonly<NodeHeaderProps>): JSX.Element {
  const task = ClientTaskRegister[taskType];
  const { deleteElements, getNode, addNodes } = useReactFlow();

  return (
    <div className="flex items-center gap-2 p-2">
      <task.icon />
      <div className="flex items-center justify-between w-full">
        <p className="text-xs font-bold uppercase text-muted-foreground">
          {task.label}
        </p>
        <div className="flex gap-1 items-center">
          {task.isEntryPoint ? <Badge>Entry point</Badge> : null}

          <Badge className="gap-2 items-center text-xs">
            <CoinsIcon size={16} />
            {task.credits}
          </Badge>
          {!task.isEntryPoint && (
            <>
              <Button
                className="cursor-pointer text-red-500 hover:text-red-600"
                onClick={async () => {
                  await deleteElements({
                    nodes: [
                      {
                        id: nodeId,
                      },
                    ],
                  });
                }}
                size="icon"
                variant="ghost"
              >
                <TrashIcon size={20} />
              </Button>
              <Button
                className="cursor-pointer"
                onClick={() => {
                  const node = getNode(nodeId) as AppNode;
                  const newX = node.position.x;
                  const newY =
                    node.position.y + (node.measured?.height ?? 200) + 20;
                  const newNode = createFlowNodeFunction(node.data.type, {
                    x: newX,
                    y: newY,
                  });
                  addNodes([newNode]);
                }}
                size="icon"
                variant="ghost"
              >
                <CopyIcon size={20} />
              </Button>
            </>
          )}
          <Button
            className="drag-handle cursor-grab"
            size="icon"
            variant="ghost"
          >
            <GripVerticalIcon size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
export default NodeHeader;
