import { ReactFlowProvider } from "@xyflow/react";
import { WorkflowStatus } from "@repo/types/src/workflow";
import type { WorkflowType } from "@repo/types";
import Topbar from "@/components/react-flow/topbar/topbar.tsx";
import TasksMenuSidebar from "@/components/react-flow/sidebar/tasks-menu-sidebar.tsx";
import FlowEditor from "@/components/react-flow/flow-editor.tsx";
import { FlowValidationContextProvider } from "@/context/flow-validation-context.tsx";

interface EditorProps {
  workflow: WorkflowType;
}
function Editor({ workflow }: Readonly<EditorProps>) {
  return (
    <FlowValidationContextProvider>
      <ReactFlowProvider>
        <div className="flex flex-col h-full w-full overflow-hidden">
          <Topbar
            isPublished={workflow.status === WorkflowStatus.PUBLISHED}
            subtitle={workflow.name}
            title="Workflow editor"
            workflowId={workflow.id}
          />
          <section className="flex h-full overflow-auto">
            <TasksMenuSidebar />
            <FlowEditor workflow={workflow} />
          </section>
        </div>
      </ReactFlowProvider>
    </FlowValidationContextProvider>
  );
}
export default Editor;
