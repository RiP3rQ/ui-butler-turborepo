import { DownloadIcon, LucideProps } from "lucide-react";
import { ServerSaveGeneratedCodesTask } from "./server/server-save-generated-codes";

export const SaveGeneratedCodesTask = {
  ...ServerSaveGeneratedCodesTask,
  icon: (props: LucideProps) => (
    <DownloadIcon className="stroke-purple-500 size-4" {...props} />
  ),
} as const;
