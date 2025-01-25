"use client";

import { approvePendingChanges } from "@/actions/executions/server-actions";
import { DiffEditor } from "@monaco-editor/react";
import { type PendingChange } from "@shared/types";
import { Button } from "@shared/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2Icon, Loader2Icon, TrashIcon } from "lucide-react";
import { type JSX } from "react";
import { toast } from "sonner";

interface ApproveChangesDialogProps {
  executionId: number;
  open: boolean;
  data?: PendingChange;
}

export function ApproveChangesDialog({
  executionId,
  open,
  data,
}: Readonly<ApproveChangesDialogProps>): JSX.Element | null {
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

  const isPendingChange = (data: unknown): data is PendingChange => {
    return (
      Boolean(data) &&
      typeof data === "object" &&
      data !== null &&
      "Original code" in data &&
      "Pending code" in data &&
      typeof data["Original code"] === "string" &&
      typeof data["Pending code"] === "string"
    );
  };

  if (!data || !isPendingChange(data)) {
    return null;
  }

  const renderIcon = (variant: "approve" | "reject"): JSX.Element => {
    if (isPending) {
      return <Loader2Icon className="mr-2 animate-spin" />;
    }

    return variant === "approve" ? (
      <CheckCircle2Icon className="mr-2" />
    ) : (
      <TrashIcon className="mr-2" />
    );
  };

  const originalCode = String(data?.["Original code"] ?? "");
  const pendingCode = String(data?.["Pending code"] ?? "");

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
          original={originalCode}
          modified={pendingCode}
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
