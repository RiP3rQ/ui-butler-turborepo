import type { ExecutionPhase, IExecutionPhaseStatus } from "@repo/types";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import ExecutionPhaseStatusBadge from "@/components/execution-viewer/execution-phase-status-badge";

interface ExecutionRunPhasesRendererProps {
  phases: ExecutionPhase[];
  selectedPhase: number | null;
  setSelectedPhase: (phase: number | null) => void;
  isRunning: boolean;
}

function ExecutionRunPhasesRenderer({
  phases = [],
  selectedPhase,
  setSelectedPhase,
  isRunning = false,
}: Readonly<ExecutionRunPhasesRendererProps>) {
  return (
    <div className="overflow-auto h-full px-2 py-4 space-y-2">
      {phases.map((phase, index) => (
        <Button
          className="w-full justify-between"
          key={phase.id}
          onClick={() => {
            if (isRunning) {
              return;
            }
            setSelectedPhase(selectedPhase === phase.id ? null : phase.id);
          }}
          variant={selectedPhase === phase.id ? "default" : "ghost"}
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline">{index + 1}</Badge>
            <p className="font-semibold">{phase.name}</p>
          </div>
          <ExecutionPhaseStatusBadge
            status={phase.status as IExecutionPhaseStatus}
          />
        </Button>
      ))}
    </div>
  );
}

export default ExecutionRunPhasesRenderer;
