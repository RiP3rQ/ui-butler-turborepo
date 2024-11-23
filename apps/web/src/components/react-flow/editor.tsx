import { ReactFlowProvider } from "@xyflow/react";
import type { WorkflowType } from "@repo/types";
import { WorkflowStatus } from "@repo/types";
import Topbar from "@/components/react-flow/topbar/topbar";
import TasksMenuSidebar from "@/components/react-flow/sidebar/tasks-menu-sidebar";
import FlowEditor from "@/components/react-flow/flow-editor";
import { FlowValidationContextProvider } from "@/context/flow-validation-context";

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
