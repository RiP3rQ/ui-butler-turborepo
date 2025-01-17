"use client";

import { JSX, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getRevealedCredentialValue } from "~/src/actions/credentials/server-actions";

interface RevealCredentialDialogProps {
  credentialId: number;
  children: React.ReactNode;
}

/**
 * Dialog component for revealing encrypted credentials
 */
export function RevealCredentialDialog({
  credentialId,
  children,
}: Readonly<RevealCredentialDialogProps>): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const { data: revealedCredentialValue, isLoading } = useQuery({
    queryKey: ["credential", credentialId],
    queryFn: async () => await getRevealedCredentialValue(credentialId),
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Credential Value</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <div className="font-mono text-center p-4 bg-muted rounded-md w-full max-w-xs">
              {revealedCredentialValue || "No value available"}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
