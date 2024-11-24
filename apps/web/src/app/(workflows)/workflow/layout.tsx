interface Props {
  children: React.ReactNode;
}

function WorkflowLayout({ children }: Readonly<Props>) {
  return <div className="flex flex-col w-full h-screen">{children}</div>;
}

export default WorkflowLayout;
