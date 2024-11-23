'use client';

import { useQuery } from '@tanstack/react-query';
import { CoinsIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/components/ui/table';
import { Badge } from '@repo/ui/components/ui/badge';
import type { IWorkflowExecutionStatus } from '@repo/types';
import { dateToDurationString } from '@/lib/dates';
import { getHistoricWorkflowExecutions } from '@/actions/workflows/get-historic-workflow-executions';
import { ExecutionStatusIndicator } from '@/components/execution-viewer/execution-status-indicator';

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
                         }: Readonly<ExecutionsTableProps>) {
  const router = useRouter();

  const query = useQuery({
    queryKey: ['executions', workflowId],
    initialData,
    queryFn: () => getHistoricWorkflowExecutions({ workflowId }),
    refetchInterval: 10 * 1000, // 10 seconds
  });

  return (
    <div className="border rounded-lg shadow-md overflow-auto">
      <Table className="h-full">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="text-center">Id</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Consumed credits</TableHead>
            <TableHead className="text-right text-xs text-muted-foreground">
              Started at (desc)
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="gap-2 h-full overflow-auto">
          {query.data.map((execution, index) => {
            const duration = dateToDurationString(
              execution.startedAt,
              execution.completedAt,
            );
            const formatedStartedAt =
              execution.startedAt &&
              formatDistanceToNow(execution.startedAt, { addSuffix: true });

            return (
              <TableRow
                className="cursor-pointer"
                key={execution.id + index}
                onClick={() => {
                  router.push(`/workflow/runs/${workflowId}/${execution.id}`);
                }}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold">{execution.id}</span>
                    <div className="text-muted-foreground text-xs space-x-2">
                      <span>Triggered via</span>
                      <Badge variant="outline">{execution.trigger}</Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
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
                  <div className="flex flex-col">
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
