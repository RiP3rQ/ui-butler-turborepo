import StatsChart from "@/components/analytics/stat-chart/stats-chart";
import type { DailyStats } from "@shared/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/ui/components/ui/card";
import { Layers2Icon } from "lucide-react";
import { type JSX } from "react";

interface StatsChartWrapperProps {
  data: DailyStats[];
}

export function StatsChartWrapper({
  data,
}: Readonly<StatsChartWrapperProps>): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Layers2Icon className="size-6 text-primary" />
          Workflow execution status
        </CardTitle>
        <CardDescription>
          Daily number of successful and failed workflow executions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StatsChart data={data} />
      </CardContent>
    </Card>
  );
}
