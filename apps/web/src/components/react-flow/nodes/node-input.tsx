import { Handle, Position, useEdges } from "@xyflow/react";
import { cn } from "@repo/ui/lib/utils";
import type { TaskParam } from "@repo/types/src/task";
import NodeParamField from "@/components/react-flow/nodes/param-fields/node-param-field";
import { ColorForHandle } from "@/components/react-flow/nodes/common";
import useFlowValidation from "@/hooks/use-flow-validation";

interface NodeInputProps {
  input: TaskParam;
  nodeId: string;
}
function NodeInput({ input, nodeId }: Readonly<NodeInputProps>): JSX.Element {
  const edges = useEdges();
  const { invalidInputs } = useFlowValidation();
  const isConnected = edges.some(
    (edge) => edge.target === nodeId && edge.targetHandle === input.name,
  );
  const hasError = invalidInputs
    .find((node) => node.nodeId === nodeId)
    ?.inputs.find((invalidInput) => invalidInput === input.name);

  return (
    <div
      className={cn(
        "flex justify-start relative p-3 bg-secondary w-full",
        hasError && "bg-destructive",
      )}
    >
      <NodeParamField disabled={isConnected} nodeId={nodeId} param={input} />
      {!input.hideHandle && (
        <Handle
          className={cn(
            "!bg-muted-foreground !border-2 !border-background !-right-2 !size-4",
            ColorForHandle[input.type],
          )}
          id={input.name}
          isConnectable={!isConnected}
          position={Position.Left}
          type="target"
        />
      )}
    </div>
  );
}
export default NodeInput;
