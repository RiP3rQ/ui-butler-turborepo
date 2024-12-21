import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { format } from "date-fns";
import { cn } from "@repo/ui/lib/utils";
import type { ExecutionLog, LogLevel } from "@repo/types";
import { type JSX } from "react";

interface LogsViewerProps {
  title: string;
  subTitle: string;
  logs: ExecutionLog[] | undefined;
}

function LogsViewer({
  title,
  subTitle,
  logs,
}: Readonly<LogsViewerProps>): JSX.Element {
  return (
    <Card>
      <CardHeader className="rounded-lg rounded-b-none border-b py-4 bg-gray-50 dark:bg-background">
        <CardTitle className="text-base capitalize">{title}</CardTitle>
        <CardDescription className="text-muted-foreground text-sm capitalize">
          {subTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-4">
        <Table>
          <TableHeader className="text-muted-foreground text-sm">
            <TableRow>
              <TableHead className="text-center">Time</TableHead>
              <TableHead className="text-center">Level</TableHead>
              <TableHead className="text-center">Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="w-48 text-xs text-muted-foreground p-[2px] pl-4 text-center tracking-wide">
                  {format(new Date(log.timestamp), "PP")}
                  {" - "}
                  {format(new Date(log.timestamp), "HH:mm:ss:SSS")}
                </TableCell>
                <TableCell
                  className={cn(
                    "w-20 uppercase text-xs font-bold pl-4 text-center",
                    (log.logLevel as LogLevel) === "ERROR" &&
                      "text-destructive",
                    (log.logLevel as LogLevel) === "INFO" &&
                      "text-muted-foreground",
                    (log.logLevel as LogLevel) === "WARNING" &&
                      "text-amber-500",
                    (log.logLevel as LogLevel) === "SUCCESS" &&
                      "text-green-500",
                  )}
                >
                  {log.logLevel}
                </TableCell>
                <TableCell className="text-sm flex-1 p-[3px] pl-4 text-center">
                  {log.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default LogsViewer;
