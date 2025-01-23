"use client";

import { Toaster } from "@shared/ui/components/ui/sonner";

export function ToastProvider(): React.ReactNode {
  return <Toaster position="bottom-right" />;
}
