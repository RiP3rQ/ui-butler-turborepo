import { Layers2Icon } from "lucide-react";
import type { UsedCreditsInPeriodResponse } from "@repo/types/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card.tsx";
import StatsChart from "@repo/ui/components/main-app/analytics/stat-chart/stats-chart.tsx";

interface StatsChartWrapperProps {
  data: UsedCreditsInPeriodResponse[];
}
function StatsChartWrapper({
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
export default StatsChartWrapper;
