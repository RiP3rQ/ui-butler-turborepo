"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteWorkflowFunction } from "@/actions/workflows/deleteWorkflow";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  workflowName: string;
  workflowId: string;
};
const DeleteWorkflowDialog = ({
  open,
  setOpen,
  workflowName,
  workflowId,
}: Readonly<Props>) => {
  const [confirmText, setConfirmText] = useState<string>("");

  const { mutate, isPending } = useMutation({
    mutationFn: deleteWorkflowFunction,
    onSuccess: () => {
      toast.success("Workflow deleted successfully", { id: workflowId });
      setConfirmText("");
    },
    onError: () => {
      toast.error("Failed to delete workflow", { id: workflowId });
    },
  });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        setConfirmText("");
        setOpen(open);
      }}
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
        <div className={"flex flex-col py-4 gap-2"}>
          <p>
            If you are sure, enter <b>{workflowName}</b> to confirm:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
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
            disabled={confirmText !== workflowName || isPending}
            className={
              "bg-destructive text-destructive-foreground hover:bg-destructive/70"
            }
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toast.loading("Deleting workflow...", {
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
};
export default DeleteWorkflowDialog;
