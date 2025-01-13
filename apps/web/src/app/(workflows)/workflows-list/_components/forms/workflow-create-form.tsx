import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
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
import { Button } from "@repo/ui/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { type JSX } from "react";
import type {
  createWorkflowSchema,
  CreateWorkflowSchemaType,
} from "@/schemas/workflow.ts";

interface WorkflowCreateFormProps {
  form: UseFormReturn<z.infer<typeof createWorkflowSchema>>;
  onSubmit: (data: CreateWorkflowSchemaType) => void;
  isPending: boolean;
}

export function WorkflowCreateForm({
  form,
  onSubmit,
  isPending,
}: Readonly<WorkflowCreateFormProps>): JSX.Element {
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
