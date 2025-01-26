"use client";
import { CheckIcon } from "@radix-ui/react-icons";
import { useReactFlow } from "@xyflow/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Button } from "@shared/ui/components/ui/button";
import { type JSX } from "react";
import { updateWorkflowByIdFunction } from "@/actions/workflows/server-actions";
import { getErrorMessage } from "@/lib/get-error-message";

interface SaveButtonProps {
  workflowId: number;
}

function SaveButton({ workflowId }: Readonly<SaveButtonProps>): JSX.Element {
  const { toObject } = useReactFlow();

  const { mutate, isPending } = useMutation({
    mutationFn: updateWorkflowByIdFunction,
    onSuccess: () => {
      toast.success("Workflow updated successfully", { id: "update-workflow" });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error), { id: "update-workflow" });
    },
  });

  return (
    <Button
      className="flex items-center gap-2"
      disabled={isPending}
      onClick={() => {
        const workflowDefinition = JSON.stringify(toObject());
        toast.loading("Updating workflow", { id: "update-workflow" });
        mutate({ workflowId, definition: workflowDefinition });
      }}
      variant="outline"
    >
      {isPending ? (
        <>
          <Loader2Icon className="size-4 animate-spin" />
          Saving ...
        </>
      ) : (
        <>
          <CheckIcon className="size-4 stroke-green-400" />
          Save
        </>
      )}
    </Button>
  );
}
export default SaveButton;
