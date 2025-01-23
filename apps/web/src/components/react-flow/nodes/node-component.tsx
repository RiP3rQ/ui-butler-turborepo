import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { AppNodeData } from "@shared/types";
import { Badge } from "@shared/ui/components/ui/badge";
import { ClientTaskRegister } from "@shared/tasks-registry";
import NodeCard from "@/components/react-flow/nodes/node-card";
import NodeHeader from "@/components/react-flow/nodes/node-header";
import NodeInputs from "@/components/react-flow/nodes/node-inputs";
import NodeInput from "@/components/react-flow/nodes/node-input";
import NodeOutputs from "@/components/react-flow/nodes/node-outputs";
import NodeOutput from "@/components/react-flow/nodes/node-output";

const DEV_MODE = process.env.NODE_ENV === "development";

const NodeComponent = memo(function NodeComponent(props: Readonly<NodeProps>) {
  const nodeData = props.data as AppNodeData;
  const task = ClientTaskRegister[nodeData.type];

  return (
    <NodeCard
      isSelected={Boolean(props.selected)}
      nodeId={props.id}
      isEntryPoint={task.isEntryPoint}
    >
      {task.isEntryPoint ? (
        <Badge className="bg-green-500 rounded-sm">Entry Point</Badge>
      ) : null}
      {DEV_MODE ? <Badge>{props.id}</Badge> : null}
      <NodeHeader nodeId={props.id} taskType={nodeData.type} />
      <NodeInputs>
        {task.inputs.map((input) => (
          <NodeInput
            input={input}
            key={`${props.id}-input-${input.name}`}
            nodeId={props.id}
          />
        ))}
      </NodeInputs>
      <NodeOutputs>
        {task.outputs.map((output) => (
          <NodeOutput
            key={`${props.id}-output-${output.name}`}
            output={output}
          />
        ))}
      </NodeOutputs>
    </NodeCard>
  );
});

export default NodeComponent;
NodeComponent.displayName = "NodeComponent";
