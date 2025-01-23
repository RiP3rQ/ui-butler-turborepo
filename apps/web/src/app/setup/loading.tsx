import { Separator } from "@shared/ui/components/ui/separator";
import { Loader2Icon } from "lucide-react";
import { type JSX } from "react";
import { Logo } from "@shared/ui/components/logo";

export default function LoadingPage(): JSX.Element {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
      <Logo iconSize={100} fontSize="text-3xl" />
      <Separator className="max-w-xs" />
      <div className="flex items-center justify-center gap-2">
        <Loader2Icon size={16} className="animate-spin stroke-primary" />
        <p className="text-muted-foreground text-2xl">
          Setting up your account...
        </p>
      </div>
    </div>
  );
}
