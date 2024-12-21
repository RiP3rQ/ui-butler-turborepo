import type { LucideIcon } from "lucide-react";
import { type JSX, type ReactNode } from "react";

interface ExecutionLabelProps {
  icon: LucideIcon;
  label: ReactNode;
  value: ReactNode;
}

function ExecutionLabel({
  icon: Icon,
  label,
  value,
}: Readonly<ExecutionLabelProps>): JSX.Element {
  return (
    <div className="flex justify-between items-center py-2 px-4 text-sm">
      <div className="text-muted-foreground flex items-center gap-2">
        <Icon className="stroke-muted-foreground" size={20} />
        <span>{label}</span>
      </div>
      <div className="font-semibold capitalize flex gap-2 items-center">
        {value}
      </div>
    </div>
  );
}
export default ExecutionLabel;
