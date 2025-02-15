import { Loader2Icon } from "lucide-react";
import { type JSX } from "react";

function Loading(): JSX.Element {
  return (
    <div className="flex w-full items-center justify-center min-h-screen">
      <Loader2Icon className="size-20 animate-spin stroke-green-400" />
    </div>
  );
}

export default Loading;
