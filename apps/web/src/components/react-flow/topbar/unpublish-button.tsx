"use client";
import { Button } from "@repo/ui/components/ui/button";
import { DownloadCloudIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type JSX } from "react";
import useWorkflowExecutionPlan from "@/hooks/use-workflow-execution-plan";
import { unpublishWorkflowFunction } from "@/actions/workflows/server-actions";

interface UnpublishButtonProps {
  workflowId: number;
}

function UnpublishButton({
  workflowId,
}: Readonly<UnpublishButtonProps>): JSX.Element {
  const queryClient = useQueryClient();
  const generate = useWorkflowExecutionPlan();

  const { mutate, isPending } = useMutation({
    mutationFn: unpublishWorkflowFunction,
    onSuccess: () => {
      toast.success("Workflow unpublished successfully", {
        id: "unpublish-workflow",
      });
      void queryClient.invalidateQueries({
        queryKey: ["workflow", workflowId],
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
        if (!plan) {
          // Client-side validation!
          return;
        }

        toast.loading("Unpublishing workflow...", { id: "unpublish-workflow" });
        mutate(workflowId);
      }}
      variant="outline"
    >
      <DownloadCloudIcon className="size-4 stroke-pink-400" />
      Unpublish
    </Button>
  );
}
export default UnpublishButton;
