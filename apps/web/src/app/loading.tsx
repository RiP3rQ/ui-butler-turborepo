import { Loader2Icon } from "lucide-react";
import { type JSX } from "react";

export default function LoadingPage(): JSX.Element {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex items-center justify-center space-x-4">
        <Loader2Icon className="size-12 animate-spin" />
        <p>Loading page content...</p>
      </div>
    </div>
  );
}

// TODO: BETTER LOADING PAGE
