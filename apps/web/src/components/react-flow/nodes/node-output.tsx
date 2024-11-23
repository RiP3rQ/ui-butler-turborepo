import { Handle, Position } from "@xyflow/react";
import { cn } from "@repo/ui/lib/utils";
import type { TaskParamType } from "@repo/types";
import { ColorForHandle } from "@/components/react-flow/nodes/common";

interface NodeOutputProps {
  output: { name: string; type: TaskParamType };
}
function NodeOutput({ output }: Readonly<NodeOutputProps>): JSX.Element {
  return (
    <div className="flex justify-end relative p-3 bg-secondary w-full">
      <p className="text-xs text-muted-foreground">{output.name}</p>
      <Handle
        className={cn(
          "!bg-muted-foreground !border-2 !border-background !-right-2 !size-4",
          ColorForHandle[output.type],
        )}
        id={output.name}
        position={Position.Right}
        type="source"
      />
    </div>
  );
}
export default NodeOutput;
