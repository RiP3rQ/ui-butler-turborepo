"use client";

import { useQuery } from "@tanstack/react-query";
import type { IExecutionPhaseStatus } from "@repo/types";
import { WorkflowExecutionStatus } from "@repo/types";
import {
  CalendarIcon,
  CircleDashedIcon,
  ClockIcon,
  CoinsIcon,
  Loader2Icon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@repo/ui/components/ui/separator";
import { useEffect, useState } from "react";
import { Badge } from "@repo/ui/components/ui/badge";
import ExecutionRunPhasesRenderer from "@/components/execution-viewer/execution-run-phases-renderer";
import ExecutionRunPhasesHeader from "@/components/execution-viewer/execution-run-phases-header";
import ExecutionLabel from "@/components/execution-viewer/execution-label";
import { getWorkflowExecutionWithPhasesDetailsFunction } from "@/actions/workflows/get-workflow-execution-details";
import ParameterViewer from "@/components/execution-viewer/parameter-viewer";
import LogsViewer from "@/components/execution-viewer/logs-viewer";
import ExecutionPhaseStatusBadge from "@/components/execution-viewer/execution-phase-status-badge";
import CountUpWrapper from "@/components/credits/count-up-wrapper";
import { dateToDurationString } from "@/lib/dates";
import { getPhasesTotalCost } from "@/lib/get-phases-total-cost";
import { getWorkflowPhaseDetailsFunction } from "@/actions/workflows/get-workflow-phase-details";

export type ExecutionData = Awaited<
  ReturnType<typeof getWorkflowExecutionWithPhasesDetailsFunction>
>;

interface ExecutionViewerProps {
  initialData: ExecutionData;
}

function ExecutionViewer({ initialData }: Readonly<ExecutionViewerProps>) {
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ["execution", initialData.id],
    initialData,
    queryFn: () =>
      getWorkflowExecutionWithPhasesDetailsFunction({
        executionId: initialData.id,
      }),
    refetchInterval: (q) =>
      q.state.data?.status === WorkflowExecutionStatus.RUNNING ? 1000 : false,
  });

  const isRunning = query.data.status === WorkflowExecutionStatus.RUNNING;

  // currently running phase-phase-executors
  useEffect(() => {
    // While running we auto-select the currently running phase-phase-executors in sidebar
    const allPhases = query.data.phases ?? [];
    if (isRunning) {
      // Select the last executed phase-phase-executors
      const phaseToSelect = [...allPhases].sort((a, b) =>
        (a.startedAt ?? new Date()) > (b.startedAt ?? new Date()) ? -1 : 1,
      )[0];

      setSelectedPhase(phaseToSelect?.id ?? null);
      return;
    }
    const phaseToSelect = [...allPhases].sort((a, b) =>
      (a.completedAt ?? new Date()) > (b.completedAt ?? new Date()) ? -1 : 1,
    )[0];
    setSelectedPhase(phaseToSelect?.id ?? null);
  }, [query.data.phases, isRunning, setSelectedPhase]);

  const phaseDetails = useQuery({
    queryKey: ["phaseDetails", selectedPhase, query.data.status],
    enabled: selectedPhase !== null,
    queryFn: () => getWorkflowPhaseDetailsFunction({ phaseId: selectedPhase! }),
  });

  const duration = dateToDurationString(
    query.data.startedAt,
    query.data.completedAt,
  );

  const creaditsConsumed = getPhasesTotalCost(query.data.phases || []);

  return (
    <div className="flex w-full h-full">
      <aside className="w-[440px] min-w-[440px] max-w-[440px] border-r-2 border-separate flex flex-grow flex-col overflow-hidden">
        <div className="py-4 px-2">
          <ExecutionLabel
            icon={CircleDashedIcon}
            label="Status"
            value={
              <div className="font-semibold capitalize flex gap-2 items-center">
                <ExecutionPhaseStatusBadge
                  status={query.data.status as IExecutionPhaseStatus} // SHOULD be casted as WorkflowExecutionStatus
                />
                <span>{query.data.status}</span>
              </div>
            }
          />
          <ExecutionLabel
            icon={CalendarIcon}
            label="Started at"
            value={
              <span className="lowercase">
                {query.data.startedAt
                  ? formatDistanceToNow(new Date(query.data.startedAt), {
                      addSuffix: true,
                    })
                  : "-"}
              </span>
            }
          />
          <ExecutionLabel
            icon={ClockIcon}
            label="Duration"
            value={
              duration ? (
                duration
              ) : (
                <Loader2Icon className="animate-spin" size={20} />
              )
            }
          />
          <ExecutionLabel
            icon={CoinsIcon}
            label="Credits"
            value={<CountUpWrapper value={creaditsConsumed} />}
          />
        </div>
        <Separator />
        <ExecutionRunPhasesHeader />
        <Separator />
        <ExecutionRunPhasesRenderer
          isRunning={isRunning}
          phases={query.data.phases || []}
          selectedPhase={selectedPhase}
          setSelectedPhase={setSelectedPhase}
        />
      </aside>
      <div className="flex w-full h-full">
        {/*  TODO: CREATE A CUSTOM RENDERER */}
        {isRunning ? (
          <div className="flex w-full h-full justify-center items-center flex-col gap-2">
            <div>
              <Loader2Icon className="animate-spin" size={40} />
            </div>
            <div>
              <p className="font-bold">
                Workflow is being executed, please wait...
              </p>
            </div>
          </div>
        ) : null}
        {!isRunning && !selectedPhase && (
          <div className="flex w-full h-full justify-center items-center flex-col gap-2">
            <div className="flex flex-col gap-1 text-center">
              <p className="font-bold text-2xl">No phase selected</p>
              <p className="text-md text-muted-foreground">
                Select a phase to view its details
              </p>
            </div>
          </div>
        )}
        {!isRunning && selectedPhase && phaseDetails.data ? (
          <div className="flex flex-col py-4 container gap-4 overflow-auto">
            <div className="flex items-center gap-2">
              {/*  TIME BADGE */}
              <Badge className="space-x-4" variant="outline">
                <div className="flex gap-1 items-center">
                  <ClockIcon className="stroke-muted-foreground" size={18} />
                  <span>Duration</span>
                </div>
                <span>
                  {dateToDurationString(
                    phaseDetails.data.startedAt,
                    phaseDetails.data.completedAt,
                  ) || "-"}
                </span>
              </Badge>
              {/* Creadits BADGE*/}
              <Badge className="space-x-4" variant="outline">
                <div className="flex gap-1 items-center">
                  <CoinsIcon className="stroke-muted-foreground" size={18} />
                  <span>Credits</span>
                </div>
                <span>{phaseDetails.data.creditsCost}</span>
              </Badge>
            </div>

            <ParameterViewer
              paramsJSON={phaseDetails.data.inputs}
              subTitle="Inputs used for this phase-executors"
              title="Inputs"
            />

            <ParameterViewer
              paramsJSON={phaseDetails.data.outputs}
              subTitle="Outputs generated by this phase-executors"
              title="Outputs"
            />

            <LogsViewer
              logs={phaseDetails.data.logs}
              subTitle="Logs generated by this phase-executors"
              title="Logs"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ExecutionViewer;
