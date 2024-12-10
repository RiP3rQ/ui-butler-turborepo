import { BookCheckIcon, LucideProps } from "lucide-react";
import { ServerCreateTypeScriptDocsTask } from "./server/server-create-ts-docs";

export const CreateTypeScriptDocsTask = {
  ...ServerCreateTypeScriptDocsTask,
  icon: (props: LucideProps) => (
    <BookCheckIcon className="stroke-green-400 size-4" {...props} />
  ),
} as const;
