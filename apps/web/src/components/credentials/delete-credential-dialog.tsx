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
  AlertDialogTrigger,
} from "@repo/ui/components/ui/alert-dialog";
import { Input } from "@repo/ui/components/ui/input";
import { type JSX, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/ui/button";
import { XIcon } from "lucide-react";
import { deleteCredentialFunction } from "@/actions/credentials/server-actions";

interface DeleteCredentialDialogProps {
  name: string;
  credentialId: number;
}

export function DeleteCredentialDialog({
  name,
  credentialId,
}: Readonly<DeleteCredentialDialogProps>): JSX.Element {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>("");

  const { mutate, isPending } = useMutation({
    mutationFn: deleteCredentialFunction,
    onSuccess: () => {
      toast.success("Credential deleted successfully", { id: credentialId });
      setConfirmText("");
      // @ts-expect-error Reason: queryClient has no types
      void queryClient.invalidateQueries("user-credentials");
    },
    onError: () => {
      toast.error("Failed to delete credential", { id: credentialId });
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
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <XIcon size={18} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this credential?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. If you delete this credential, all of
            its data will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col py-4 gap-2">
          <p>
            If you are sure, enter <b>{name}</b> to confirm:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
            }}
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
            disabled={confirmText !== name || isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/70"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toast.loading("Deleting credential...", {
                id: credentialId,
              });
              mutate({ id: credentialId });
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

// TODO: LIST WHERE CREDENTIALS ARE USED IN THE APP
