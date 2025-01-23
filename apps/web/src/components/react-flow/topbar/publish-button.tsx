"use client";
import { UploadIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useReactFlow } from "@xyflow/react";
import { Button } from "@shared/ui/components/ui/button";
import { type JSX } from "react";
import useWorkflowExecutionPlan from "@/hooks/use-workflow-execution-plan";
import { publishWorkflowFunction } from "@/actions/workflows/server-actions";

interface PublishButtonProps {
  workflowId: number;
}

function PublishButton({
  workflowId,
}: Readonly<PublishButtonProps>): JSX.Element {
  const queryClient = useQueryClient();
  const generate = useWorkflowExecutionPlan();
  const { toObject } = useReactFlow();

  const { mutate, isPending } = useMutation({
    mutationFn: publishWorkflowFunction,
    onSuccess: () => {
      toast.success("Workflow published successfully", {
        id: "publish-workflow",
      });
      queryClient.invalidateQueries({
        queryKey: ["workflow", workflowId],
      });
    },
    onError: () => {
      toast.error("Failed to publish workflow", { id: "publish-workflow" });
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

        toast.loading("Publishing workflow...", { id: "publish-workflow" });
        mutate({ workflowId, flowDefinition: JSON.stringify(toObject()) });
      }}
      variant="outline"
    >
      <UploadIcon className="size-4 stroke-purple-500" />
      Publish
    </Button>
  );
}
export default PublishButton;
