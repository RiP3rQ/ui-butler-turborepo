import React from "react";
import { cn } from "@shared/ui/lib/utils";

interface WrapperProps {
  className?: string;
  children: React.ReactNode;
}

export function Wrapper({
  children,
  className,
}: Readonly<WrapperProps>): React.ReactNode {
  return (
    <div
      className={cn(
        "h-full mx-auto w-full max-w-screen-xl px-4 md:px-20",
        className,
      )}
    >
      {children}
    </div>
  );
}
