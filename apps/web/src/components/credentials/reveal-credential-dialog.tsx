"use client";

import { type JSX, useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared/ui/components/ui/dialog";
import { Button } from "@shared/ui/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  type UserCredentials,
  type UserDecryptedCredentials,
} from "@shared/types";
import { cn } from "@shared/ui/lib/utils";
import { toast } from "sonner";
import { getRevealedCredentialValue } from "@/actions/credentials/server-actions";

interface RevealCredentialDialogProps {
  credential: UserCredentials;
  children: React.ReactNode;
}

/**
 * Dialog component for revealing encrypted credentials with copy functionality
 * and improved security measures
 */
export function RevealCredentialDialog({
  credential,
  children,
}: Readonly<RevealCredentialDialogProps>): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isValueVisible, setIsValueVisible] = useState(false);

  const { data: revealedCredential, isLoading } =
    useQuery<UserDecryptedCredentials>({
      queryKey: ["credential", credential.id],
      queryFn: async () => await getRevealedCredentialValue(credential.id),
      enabled: isOpen,
    });

  const handleCopyToClipboard = useCallback(async () => {
    if (revealedCredential?.value) {
      await navigator.clipboard.writeText(revealedCredential.value);
      toast.success("Copied to clipboard", {
        description: "The credential value has been copied to your clipboard.",
        duration: 2000,
      });
    }
  }, [revealedCredential?.value]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {credential.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Decrypting credential...</span>
            </div>
          ) : (
            <>
              <div className="relative">
                <div
                  className={cn(
                    "font-mono p-4 bg-muted rounded-lg w-full break-all relative",
                    !isValueVisible && "blur-sm select-none",
                  )}
                >
                  {revealedCredential?.value ?? "No value available"}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => {
                    setIsValueVisible(!isValueVisible);
                  }}
                >
                  {isValueVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-2"
                  onClick={handleCopyToClipboard}
                  disabled={!revealedCredential?.value}
                >
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
