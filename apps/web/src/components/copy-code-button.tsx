"use client";
import { type JSX, useCallback, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import TooltipWrapper from "@repo/ui/components/tooltip-wrapper";

interface CopyButtonProps {
  value: string;
  className?: string;
}

export function CopyButton({ value, className }: CopyButtonProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    if (copied) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      // Reset states after delay
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);

      // Cleanup timeout on unmount
      return () => {
        clearTimeout(timer);
      };
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [value, copied]);

  return (
    <TooltipWrapper content={copied ? "Copied!" : "Copy code to clipboard"}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0 transition-all duration-200",
          copied && "opacity-50",
          className,
        )}
        onClick={void onCopy}
      >
        <span className="sr-only">{copied ? "Copied!" : "Copy code"}</span>

        {copied ? (
          <CheckIcon className="h-4 w-4 text-green-500" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
      </Button>
    </TooltipWrapper>
  );
}
