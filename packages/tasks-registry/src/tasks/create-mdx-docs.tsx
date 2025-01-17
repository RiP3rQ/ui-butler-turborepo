import { type LucideProps, TabletSmartphoneIcon } from "lucide-react";
import { ServerCreateMDXDocsTask } from "./server/server-create-mdx-docs";

export const CreateMDXDocsTask = {
  ...ServerCreateMDXDocsTask,
  icon: (props: LucideProps) => (
    <TabletSmartphoneIcon className="stroke-green-400 size-4" {...props} />
  ),
} as const;
