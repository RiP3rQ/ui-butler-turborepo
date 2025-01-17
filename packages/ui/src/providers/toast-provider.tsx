"use client";

import { Toaster } from "@repo/ui/components/ui/sonner";

function ToastProvider(): React.ReactNode {
  return <Toaster position="bottom-right" />;
}

export default ToastProvider;
