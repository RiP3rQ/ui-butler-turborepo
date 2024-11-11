"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Loader2Icon, PlayIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { runWorkflowFunction } from "@/actions/workflow/runWorkflow";

interface RunWorkflowButtonProps {
  workflowId: number;
}
function RunWorkflowButton({ workflowId }: Readonly<RunWorkflowButtonProps>) {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: runWorkflowFunction,
    onSuccess: ({ url }) => {
      toast.success("Workflow executed successfully", { id: workflowId });
      router.push(url);
    },
    onError: () => {
      toast.error("Failed to execute workflow", { id: workflowId });
    },
  });

  return (
    <Button
      className="flex items-center gap-2"
      onClick={() => {
        toast.loading("Executing workflow...", { id: workflowId });
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
export default RunWorkflowButton;
