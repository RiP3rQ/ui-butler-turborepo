import { Separator } from "@repo/ui/components/ui/separator";
import Icons from "@repo/ui/components/landing-page/icons";

interface Props {
  children: React.ReactNode;
}

function WorkflowLayout({ children }: Readonly<Props>) {
  return (
    <div className="flex flex-col w-full h-screen">
      {children}
      <Separator />
      <footer className="flex items-center justify-between p-2 gap-4">
        <Icons.logo fontSize="text-xl" iconSize={16} />
      </footer>
    </div>
  );
}

export default WorkflowLayout;
