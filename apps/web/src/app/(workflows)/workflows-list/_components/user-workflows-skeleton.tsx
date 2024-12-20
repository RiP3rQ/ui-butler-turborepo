import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { type JSX } from "react";

export function UserWorkflowsSkeleton(): JSX.Element {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((_, index) => (
        <Skeleton className="w-full h-32" key={index} />
      ))}
    </div>
  );
}
