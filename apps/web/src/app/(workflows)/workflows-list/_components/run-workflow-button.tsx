"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Loader2Icon, PlayIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { runWorkflow } from "@/actions/executions/run-workflow.ts";

interface RunWorkflowButtonProps {
  workflowId: number;
}
export function RunWorkflowButton({
  workflowId,
}: Readonly<RunWorkflowButtonProps>) {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: runWorkflow,
    onSuccess: ({ url }) => {
      toast.success("Workflow executed successfully", { id: workflowId });
      router.push(url);
    },
    onError: () => {
      toast.error("Failed to execute executions", { id: workflowId });
    },
  });

  return (
    <Button
      className="flex items-center gap-2"
      onClick={() => {
        toast.loading("Executing executions...", { id: workflowId });
        mutate({ workflowId });
      }}
      size="sm"
      type="button"
      variant="outline"
    >
      {isPending ? (
        <Loader2Icon className="size-4 stroke-amber-500 animate-spin" />
      ) : (
        <PlayIcon className="size-4 stroke-primary" />
      )}
      {isPending ? "Running" : "Run"}
    </Button>
  );
}
