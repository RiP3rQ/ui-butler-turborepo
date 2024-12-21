import { type JSX } from "react";

interface WorkflowLayoutProps {
  children: React.ReactNode;
}

function WorkflowLayout({
  children,
}: Readonly<WorkflowLayoutProps>): JSX.Element {
  return <div className="flex flex-col w-full h-screen">{children}</div>;
}

export default WorkflowLayout;
