"use client";

import { Toaster } from "@repo/ui/components/ui/sonner";

export function ToastProvider(): React.ReactNode {
  return <Toaster position="bottom-right" />;
}
