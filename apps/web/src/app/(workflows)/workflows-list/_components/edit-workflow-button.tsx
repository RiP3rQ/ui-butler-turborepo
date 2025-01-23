import { cn } from "@shared/ui/lib/utils";
import { buttonVariants } from "@shared/ui/components/ui/button";
import { ShuffleIcon } from "lucide-react";
import Link from "next/link";
import { type JSX } from "react";

interface EditWorkflowButtonProps {
  workflowId: number;
}
export function EditWorkflowButton({
  workflowId,
}: Readonly<EditWorkflowButtonProps>): JSX.Element {
  return (
    <Link
      className={cn(
        buttonVariants({
          variant: "outline",
          size: "sm",
        }),
        "flex items-center gap-2",
      )}
      href={`/workflow/editor/${workflowId.toString()}`}
    >
      <ShuffleIcon className="size-4" />
      Edit
    </Link>
  );
}
