import { cn } from "@repo/ui/lib/utils";
import { buttonVariants } from "@repo/ui/components/ui/button";
import { ShuffleIcon } from "lucide-react";
import Link from "next/link";

interface EditWorkflowButtonProps {
  workflowId: number;
}
function EditWorkflowButton({
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
      href={`/workflow/editor/${workflowId}`}
    >
      <ShuffleIcon className="size-4" />
      Edit
    </Link>
  );
}
export default EditWorkflowButton;
