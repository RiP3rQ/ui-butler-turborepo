"use client";

import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Layers2Icon } from "lucide-react";
import CustomDialogHeader from "@repo/ui/components/main-app/custom-dialog-header";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { CreateWorkflowSchemaType } from "@/schemas/workflow";
import { createWorkflowSchema } from "@/schemas/workflow";
import { WorkflowCreateForm } from "@/app/(workflows)/workflows-list/_components/forms/workflow-create-form.tsx";
import { createWorkflowFunction } from "@/actions/workflows/createWorkflow";

interface CreateWorkflowDialogProps {
  triggerText?: string;
}
export function CreateWorkflowDialog({
  triggerText,
}: Readonly<CreateWorkflowDialogProps>): JSX.Element {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const form = useForm<z.infer<typeof createWorkflowSchema>>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: {},
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createWorkflowFunction,
    onSuccess: (res) => {
      toast.success("Workflow created successfully", { id: "create-workflow" });
      router.push(`/workflow/editor/${res.id}`);
      form.reset();
    },
    onError: () => {
      toast.error("Failed to create workflow", { id: "create-workflow" });
    },
  });

  const onSubmit = useCallback(
    (data: CreateWorkflowSchemaType) => {
      toast.loading("Creating workflow...", { id: "create-workflow" });
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
        <Button type="button" variant="default">
          {triggerText ?? "Create Workflow"}
        </Button>
      </DialogTrigger>
      <DialogContent className="px-4">
        <CustomDialogHeader
          icon={Layers2Icon}
          subTitle="Start building your workflow"
          title="Create Workflow"
        />
        <WorkflowCreateForm
          form={form}
          isPending={isPending}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
