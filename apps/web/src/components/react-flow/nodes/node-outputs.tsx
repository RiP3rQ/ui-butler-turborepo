import { type JSX } from "react";

interface NodeOutputsProps {
  children: React.ReactNode;
}
function NodeOutputs({ children }: Readonly<NodeOutputsProps>): JSX.Element {
  return <div className="flex flex-col divide-y gap-1">{children}</div>;
}
export default NodeOutputs;
