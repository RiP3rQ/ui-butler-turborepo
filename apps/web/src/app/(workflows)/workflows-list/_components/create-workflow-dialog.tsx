"use client";

import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Layers2Icon, Loader2Icon } from "lucide-react";
import CustomDialogHeader from "@repo/ui/components/main-app/custom-dialog-header";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { CreateWorkflowSchemaType } from "@/schemas/workflow";
import { createWorkflowSchema } from "@/schemas/workflow";
import { createWorkflowFunction } from "@/actions/workflows/createWorkflow";

interface Props {
  triggerText?: string;
}
function CreateWorkflowDialog({ triggerText }: Readonly<Props>) {
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
        <WorkflowForm form={form} isPending={isPending} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
export default CreateWorkflowDialog;

function WorkflowForm({
  form,
  onSubmit,
  isPending,
}: Readonly<{
  form: UseFormReturn<z.infer<typeof createWorkflowSchema>>;
  onSubmit: (data: CreateWorkflowSchemaType) => void;
  isPending: boolean;
}>) {
  return (
    <Form {...form}>
      <form className="space-y-6 w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex gap-1 items-center">
                Name
                <p className="text-primary text-xs">(Required)</p>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Choose a descriptive name for your workflow
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex gap-1 items-center">
                Description
                <p className="text-muted-foreground text-xs">(optional)</p>
              </FormLabel>
              <FormControl>
                <Textarea {...field} className="resize-none" />
              </FormControl>
              <FormDescription>Describe your workflow</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? <Loader2Icon className="animate-spin" /> : "Proceed"}
        </Button>
      </form>
    </Form>
  );
}
