"use client";
import { Button } from "@repo/ui/components/ui/button";
import { DownloadCloudIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useWorkflowExecutionPlan from "@/hooks/use-workflow-execution-plan";
import { unpublishWorkflowFunction } from "@/actions/workflows/unpublish-workflow";
import useWorkflowExecutionPlan2 from "@/hooks/use-workflow-execution-plan2";

interface UnpublishButtonProps {
  workflowId: number;
}

function UnpublishButton({
  workflowId,
}: Readonly<UnpublishButtonProps>): JSX.Element {
  const generate = useWorkflowExecutionPlan();
  const generate2 = useWorkflowExecutionPlan2();

  const { mutate, isPending } = useMutation({
    mutationFn: unpublishWorkflowFunction,
    onSuccess: () => {
      toast.success("Workflow unpublished successfully", {
        id: "unpublish-workflow",
      });
    },
    onError: () => {
      toast.error("Failed to unpublish workflow", { id: "unpublish-workflow" });
    },
  });

  return (
    <Button
      className="flex items-center gap-2"
      disabled={isPending}
      onClick={() => {
        // Client-side validation + return in form of execution plan
        const plan = generate();
        const plan2 = generate2();
        console.dir(plan, { depth: null, colors: true });
        console.dir(plan2, { depth: null, colors: true });
        if (!plan) {
          // Client-side validation!
          return;
        }

        toast.loading("Unpublishing workflow...", { id: "unpublish-workflow" });
        mutate({ workflowId });
      }}
      variant="outline"
    >
      <DownloadCloudIcon className="size-4 stroke-pink-400" />
      Unpublish
    </Button>
  );
}
export default UnpublishButton;
