"use client";

import { type JSX, useCallback, useState } from "react";
import { CopyIcon, Layers2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CustomDialogHeader from "@repo/ui/components/custom-dialog-header";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { cn } from "@repo/ui/lib/utils";
import type { DuplicateWorkflowSchemaType } from "@/schemas/workflow";
import { duplicateWorkflowSchema } from "@/schemas/workflow";
import { WorkflowDuplicateForm } from "@/app/(workflows)/workflows-list/_components/forms/workflow-duplicate-form";
import { duplicateWorkflow } from "@/actions/workflows/server-actions";

interface DuplicateWorkflowDialogProps {
  workflowId: number;
}
export function DuplicateWorkflowDialog({
  workflowId,
}: Readonly<DuplicateWorkflowDialogProps>): JSX.Element {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const form = useForm<z.infer<typeof duplicateWorkflowSchema>>({
    resolver: zodResolver(duplicateWorkflowSchema),
    defaultValues: {
      workflowId,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: duplicateWorkflow,
    onSuccess: (res) => {
      toast.success("Workflow duplicated successfully", {
        id: "duplicate-executions",
      });
      router.push(`/workflow/editor/${String(res.id)}`);
      form.reset();
      setIsOpen((prev) => !prev);
    },
    onError: () => {
      toast.error("Failed to duplicate executions", {
        id: "duplicate-executions",
      });
    },
  });

  const onSubmit = useCallback(
    (data: DuplicateWorkflowSchemaType) => {
      toast.loading("Duplicating the executions...", {
        id: "duplicate-executions",
      });
      mutate(data);
    },
    [mutate],
  );

  return (
    <Dialog
      onOpenChange={(open) => {
        form.reset();
        setIsOpen(open);
      }}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button
          className={cn(
            "ml-2 transition-opacity duration-200 opacity-0 group-hover/card:opacity-100",
          )}
          size="icon"
          variant="ghost"
        >
          <CopyIcon className="size-4 text-muted-foreground cursor-pointer" />
        </Button>
      </DialogTrigger>
      <DialogContent className="px-4">
        <CustomDialogHeader
          icon={Layers2Icon}
          subTitle="Create a copy of the existing workflow"
          title="Duplicate Workflow"
        />
        <WorkflowDuplicateForm
          form={form}
          isPending={isPending}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
