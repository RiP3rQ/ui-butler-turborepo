"use client";

import { getHistoricWorkflowExecutions } from "@/actions/workflows/server-actions";
import { ExecutionStatusIndicator } from "@/components/execution-viewer/execution-status-indicator";
import { dateToDurationString, protoTimestampToDate } from "@/lib/dates";
import type { IWorkflowExecutionStatus } from "@shared/types";
import { Badge } from "@shared/ui/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/ui/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { CoinsIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type JSX } from "react";

type InitialDataType = Awaited<
  ReturnType<typeof getHistoricWorkflowExecutions>
>;

interface ExecutionsTableProps {
  initialData: InitialDataType;
  workflowId: number;
}

function ExecutionsTable({
  initialData,
  workflowId,
}: Readonly<ExecutionsTableProps>): JSX.Element {
  const router = useRouter();

  const query = useQuery({
    queryKey: ["executions", workflowId],
    initialData,
    queryFn: () => getHistoricWorkflowExecutions({ workflowId }),
    refetchInterval: 10 * 1000, // 10 seconds
  });

  return (
    <div className="border rounded-lg shadow-md overflow-auto">
      <Table className="h-full bg-background">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Id</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Consumed credits</TableHead>
            <TableHead className="text-right text-xs text-muted-foreground">
              Started at (desc)
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="gap-2 h-full overflow-auto ">
          {query.data.executions.map((execution) => {
            const duration = dateToDurationString(
              protoTimestampToDate(execution.startedAt).toISOString(),
              protoTimestampToDate(execution.completedAt).toISOString(),
            );
            const formatedStartedAt =
              protoTimestampToDate(execution.startedAt) &&
              formatDistanceToNow(protoTimestampToDate(execution.startedAt), {
                addSuffix: true,
              });

            return (
              <TableRow
                className="cursor-pointer"
                key={execution.id}
                onClick={() => {
                  router.push(
                    `/workflow/runs/${workflowId.toString()}/${String(execution.id)}`,
                  );
                }}
              >
                <TableCell>
                  <div className="flex flex-col items-center">
                    <span className="font-semibold">{execution.id}</span>
                    <div className="text-muted-foreground text-xs space-x-2">
                      <span>Triggered via</span>
                      <Badge variant="outline">{execution.trigger}</Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center">
                    <div className="flex gap-2 items-center">
                      <ExecutionStatusIndicator
                        status={execution.status as IWorkflowExecutionStatus}
                      />
                      <span className="ml-2 font-semibold capitalize">
                        {execution.status}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-xs mx-6">
                      {duration}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center">
                    <div className="flex gap-2 items-center">
                      <CoinsIcon className="size-4 stroke-primary" />
                      <span className="ml-2 font-semibold capitalize">
                        {execution.creditsConsumed}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-xs mx-8">
                      Credits
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatedStartedAt}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default ExecutionsTable;
