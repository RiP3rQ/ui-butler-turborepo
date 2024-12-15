"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { DiffEditor } from "@monaco-editor/react";
import { type ApproveChangesRequest } from "@repo/types";
import { Button } from "@repo/ui/components/ui/button";
import { CheckCircle2Icon, Loader2Icon, TrashIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { approvePendingChanges } from "@/actions/executions/approve-reject-changes";

interface ApproveChangesDialogProps {
  executionId: number;
  open: boolean;
  data?: ApproveChangesRequest["pendingApproval"];
}

export function ApproveChangesDialog({
  executionId,
  open,
  data,
}: Readonly<ApproveChangesDialogProps>): JSX.Element {
  const { mutate, isPending } = useMutation({
    mutationFn: approvePendingChanges,
    onSuccess: () => {
      toast.success("Decision has been made", {
        id: "approve-changes",
      });
    },
    onError: () => {
      toast.error("Failed to make a decision", {
        id: "approve-changes",
      });
    },
  });

  if (!data?.["Original code"] || !data["Pending code"]) {
    return <></>;
  }

  const renderIcon = (variant: "approve" | "reject") => {
    if (isPending) {
      return <Loader2Icon className="mr-2 animate-spin" />;
    }

    return variant === "approve" ? (
      <CheckCircle2Icon className="mr-2" />
    ) : (
      <TrashIcon className="mr-2" />
    );
  };

  return (
    <Dialog open={open}>
      <DialogContent className="min-w-[90vw] w-[90vw]  max-w-[90vw] min-h-[80vh] h-[80vh] max-h-[80vh] my-auto">
        <DialogHeader>
          <DialogTitle>Approve code changes</DialogTitle>
          <DialogDescription>
            Review the code changes below and approve them or reject them. To
            continue you need to make a decision.
          </DialogDescription>
        </DialogHeader>
        <DiffEditor
          height="60vh"
          language="typescript"
          original={data["Original code"]}
          modified={data["Pending code"]}
        />
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              mutate({ executionId, decision: "reject" });
            }}
            className="w-40"
          >
            {renderIcon("reject")}
            Reject
          </Button>
          <Button
            variant="default"
            onClick={() => {
              mutate({ executionId, decision: "approve" });
            }}
            className="w-52"
          >
            {renderIcon("approve")}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
