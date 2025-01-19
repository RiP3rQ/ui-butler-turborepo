import { ImageUpIcon, type LucideProps } from "lucide-react";
import { ServerImproveStylesTask } from "./server/server-improve-styles";

export const ImproveStylesTask = {
  ...ServerImproveStylesTask,
  icon: (props: LucideProps) => (
    <ImageUpIcon className="stroke-purple-500 size-4" {...props} />
  ),
} as const;
