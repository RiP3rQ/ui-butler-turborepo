import type { AppNode, TaskParam } from "@repo/types";
import { TaskParamType } from "@repo/types";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import StringParamField from "@/components/react-flow/nodes/param-fields/string-param-field";
import CredentialParamField from "@/components/react-flow/nodes/param-fields/credential-param-field";
import SelectParamField from "@/components/react-flow/nodes/param-fields/select-param-field";
import CodeInstanceParamField from "@/components/react-flow/nodes/param-fields/code-instance-param-field";

interface NodeParamFieldProps {
  param: TaskParam;
  nodeId: string;
  disabled?: boolean;
}
function NodeParamField({
  param,
  nodeId,
  disabled = false,
}: Readonly<NodeParamFieldProps>): JSX.Element {
  const { updateNodeData, getNode } = useReactFlow();

  const node = getNode(nodeId) as AppNode;

  const value = node.data.inputs[param.name] ?? "";
  const updateNodeParamValue = useCallback(
    (val: string) => {
      updateNodeData(nodeId, {
        inputs: {
          ...node.data.inputs,
          [param.name]: val,
        },
      });
    },
    [nodeId, node.data.inputs, param.name, updateNodeData],
  );

  switch (param.type) {
    case TaskParamType.STRING:
      return (
        <StringParamField
          disabled={disabled}
          param={param}
          updateNodeParamValue={updateNodeParamValue}
          value={value}
        />
      );
    case TaskParamType.CODE_INSTANCE:
      return (
        <CodeInstanceParamField
          disabled={disabled}
          param={param}
          updateNodeParamValue={updateNodeParamValue}
          value=""
        />
      );
    case TaskParamType.SELECT:
      return (
        <SelectParamField
          disabled={disabled}
          param={param}
          updateNodeParamValue={updateNodeParamValue}
          value={value}
        />
      );
    case TaskParamType.CREDENTIAL:
      return (
        <CredentialParamField
          disabled={disabled}
          param={param}
          updateNodeParamValue={updateNodeParamValue}
          value={value}
        />
      );
    default: {
      return (
        <div className="w-full">
          <p className="text-xs text-muted-foreground">Not implemented</p>
        </div>
      );
    }
  }
}
export default NodeParamField;
