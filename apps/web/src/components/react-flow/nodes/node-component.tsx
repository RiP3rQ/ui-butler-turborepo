import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { AppNodeData } from "@repo/types";
import { Badge } from "@repo/ui/components/ui/badge";
import { ClientTaskRegister } from "@repo/tasks-registry";
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

  console.log("task", task);

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
        {task.inputs.map((input, index) => (
          <NodeInput input={input} key={index} nodeId={props.id} />
        ))}
      </NodeInputs>
      <NodeOutputs>
        {task.outputs.map((output, index) => (
          <NodeOutput key={index} output={output} />
        ))}
      </NodeOutputs>
    </NodeCard>
  );
});

export default NodeComponent;
NodeComponent.displayName = "NodeComponent";
