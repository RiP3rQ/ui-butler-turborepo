"use client";

import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyIcon, Layers2Icon, Loader2Icon } from "lucide-react";
import CustomDialogHeader from "@/components/custom-dialog-header";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  duplicateWorkflowSchema,
  DuplicateWorkflowSchemaType,
} from "@/schemas/workflow";
import { duplicateWorkflowFunction } from "@/actions/workflows/duplicateWorkflow";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  workflowId: string;
};
const DuplicateWorkflowDialog = ({ workflowId }: Readonly<Props>) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const form = useForm<z.infer<typeof duplicateWorkflowSchema>>({
    resolver: zodResolver(duplicateWorkflowSchema),
    defaultValues: {
      workflowId,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: duplicateWorkflowFunction,
    onSuccess: (res) => {
      toast.success("Workflow duplicated successfully", {
        id: "duplicate-workflow",
      });
      router.push(`/workflow/editor/${res.id}`);
      form.reset();
      setIsOpen((prev) => !prev);
    },
    onError: () => {
      toast.error("Failed to duplicate workflow", { id: "duplicate-workflow" });
    },
  });

  const onSubmit = useCallback(
    (data: DuplicateWorkflowSchemaType) => {
      toast.loading("Duplicating the workflow...", {
        id: "duplicate-workflow",
      });
      mutate(data);
    },
    [mutate],
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        form.reset();
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon"}
          className={cn(
            "ml-2 transition-opacity duration-200 opacity-0 group-hover/card:opacity-100",
          )}
        >
          <CopyIcon className={"size-4 text-muted-foreground cursor-pointer"} />
        </Button>
      </DialogTrigger>
      <DialogContent className={"px-4"}>
        <CustomDialogHeader
          icon={Layers2Icon}
          title={"Duplicate Workflow"}
          subTitle={"Create a copy of the existing workflow"}
        />
        <WorkflowForm form={form} onSubmit={onSubmit} isPending={isPending} />
      </DialogContent>
    </Dialog>
  );
};
export default DuplicateWorkflowDialog;

function WorkflowForm({
  form,
  onSubmit,
  isPending,
}: Readonly<{
  form: UseFormReturn<z.infer<typeof duplicateWorkflowSchema>>;
  onSubmit: (data: DuplicateWorkflowSchemaType) => void;
  isPending: boolean;
}>) {
  return (
    <Form {...form}>
      <form
        className={"space-y-6 w-full"}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name={"name"}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={"flex gap-1 items-center"}>
                Name
                <p className={"text-primary text-xs"}>(Required)</p>
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
          name={"description"}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={"flex gap-1 items-center"}>
                Description
                <p className={"text-muted-foreground text-xs"}>(optional)</p>
              </FormLabel>
              <FormControl>
                <Textarea {...field} className={"resize-none"} />
              </FormControl>
              <FormDescription>Describe your workflow</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className={"w-full"} type={"submit"} disabled={isPending}>
          {isPending ? <Loader2Icon className={"animate-spin"} /> : "Duplicate"}
        </Button>
      </form>
    </Form>
  );
}
