import { Loader2Icon } from "lucide-react";
import { type JSX } from "react";

function Loading(): JSX.Element {
  return (
    <div className="flex w-full items-center justify-center">
      <Loader2Icon className="size-10 animate-spin stroke-green-400" />
    </div>
  );
}

export default Loading;
