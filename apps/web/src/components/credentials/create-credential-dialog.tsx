"use client";

import { type JSX, useCallback, useState } from "react";
import { Loader2Icon, ShieldEllipsisIcon } from "lucide-react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shared/ui/components/ui/form";
import { Input } from "@shared/ui/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Textarea } from "@shared/ui/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@shared/ui/components/ui/dialog";
import { Button } from "@shared/ui/components/ui/button";
import { CustomDialogHeader } from "@shared/ui/components/custom-dialog-header";
import {
  createCredentialSchema,
  type CreateCredentialSchemaType,
} from "@/schemas/credential";
import { createCredentialFunction } from "@/actions/credentials/server-actions";

interface CreateCredentialDialogProps {
  triggerText?: string;
}

export function CreateCredentialDialog({
  triggerText,
}: Readonly<CreateCredentialDialogProps>): JSX.Element {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const form = useForm<z.infer<typeof createCredentialSchema>>({
    resolver: zodResolver(createCredentialSchema),
    defaultValues: {},
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createCredentialFunction,
    onSuccess: () => {
      toast.success("Credential created successfully", {
        id: "create-credential",
      });
      form.reset();
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: "user-credentials" });
    },
    onError: () => {
      toast.error("Failed to create credential", { id: "create-credential" });
    },
  });

  const onSubmit = useCallback(
    (data: CreateCredentialSchemaType) => {
      toast.loading("Creating credential...", { id: "create-credential" });
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
        <Button variant="default" type="button">
          {triggerText ?? "Create credential"}
        </Button>
      </DialogTrigger>
      <DialogContent className="px-4">
        <CustomDialogHeader
          icon={ShieldEllipsisIcon}
          title="Create credential"
        />
        <CredentialForm form={form} onSubmit={onSubmit} isPending={isPending} />
      </DialogContent>
    </Dialog>
  );
}

function CredentialForm({
  form,
  onSubmit,
  isPending,
}: Readonly<{
  form: UseFormReturn<z.infer<typeof createCredentialSchema>>;
  onSubmit: (data: CreateCredentialSchemaType) => void;
  isPending: boolean;
}>): JSX.Element {
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
                Enter a unique and descriptive name for the credential. <br />
                This name will be used to identify the credential
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex gap-1 items-center">
                Value
                <p className="text-primary text-xs">(Required)</p>
              </FormLabel>
              <FormControl>
                <Textarea {...field} className="resize-none" />
              </FormControl>
              <FormDescription>
                Enter the value associated with the credential. <br />
                This value will be encrypted and stored securely
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? <Loader2Icon className="animate-spin" /> : "Create"}
        </Button>
      </form>
    </Form>
  );
}
