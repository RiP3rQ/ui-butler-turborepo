"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";
import { Input } from "@repo/ui/components/ui/input";
import { deleteWorkflow } from "@/actions/workflows/delete-workflow";

interface DeleteWorkflowDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  workflowName: string;
  workflowId: number;
}
export function DeleteWorkflowDialog({
  open,
  setOpen,
  workflowName,
  workflowId,
}: Readonly<DeleteWorkflowDialogProps>): JSX.Element {
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState<string>("");

  const { mutate, isPending } = useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: () => {
      toast.success("Workflow deleted successfully", { id: workflowId });
      setConfirmText("");
      // @ts-expect-error Reason: queryClient has no types
      queryClient.invalidateQueries("workflows");
    },
    onError: () => {
      toast.error("Failed to delete executions", { id: workflowId });
    },
  });

  return (
    <AlertDialog
      onOpenChange={(open) => {
        setConfirmText("");
        setOpen(open);
      }}
      open={open}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this workflow?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. If you delete this workflow, all of
            its data will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col py-4 gap-2">
          <p>
            If you are sure, enter <b>{workflowName}</b> to confirm:
          </p>
          <Input
            onChange={(e) => {
              setConfirmText(e.target.value);
            }}
            value={confirmText}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setConfirmText("");
              setOpen(false);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/70"
            disabled={confirmText !== workflowName || isPending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toast.loading("Deleting executions...", {
                id: workflowId,
              });
              mutate(workflowId);
              setOpen(false);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
