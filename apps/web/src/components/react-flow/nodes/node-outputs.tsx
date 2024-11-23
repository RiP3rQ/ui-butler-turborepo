interface NodeOutputsProps {
  children: React.ReactNode;
}
function NodeOutputs({ children }: Readonly<NodeOutputsProps>) {
  return <div className="flex flex-col divide-y gap-1">{children}</div>;
}
export default NodeOutputs;
