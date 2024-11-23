interface NodeInputsProps {
  children: React.ReactNode;
}
function NodeInputs({ children }: Readonly<NodeInputsProps>): JSX.Element {
  return <div className="flex flex-col divide-y gap-2">{children}</div>;
}
export default NodeInputs;
