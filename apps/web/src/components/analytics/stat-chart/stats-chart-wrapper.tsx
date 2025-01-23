import { Layers2Icon } from "lucide-react";
import type { UsedCreditsInPeriodResponse } from "@shared/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/ui/components/ui/card";
import { type JSX } from "react";
import StatsChart from "@/components/analytics/stat-chart/stats-chart";

interface StatsChartWrapperProps {
  data: UsedCreditsInPeriodResponse[];
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
