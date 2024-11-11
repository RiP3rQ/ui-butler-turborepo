import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ShuffleIcon } from "lucide-react";
import Link from "next/link";

type EditWorkflowButtonProps = {
  workflowId: string;
};
const EditWorkflowButton = ({
  workflowId,
}: Readonly<EditWorkflowButtonProps>) => {
  return (
    <Link
      href={`/workflow/editor/${workflowId}`}
      className={cn(
        buttonVariants({
          variant: "outline",
          size: "sm",
        }),
        "flex items-center gap-2",
      )}
    >
      <ShuffleIcon className={"size-4"} />
      Edit
    </Link>
  );
};
export default EditWorkflowButton;
