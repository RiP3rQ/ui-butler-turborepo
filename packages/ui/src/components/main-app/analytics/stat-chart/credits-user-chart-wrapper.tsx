import { CoinsIcon } from "lucide-react";
import type { UsedCreditsInPeriodResponse } from "@repo/types/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card.tsx";
import CreditsChart from "@repo/ui/components/main-app/analytics/stat-chart/credits-chart.tsx";

interface CreditsUserChartWrapperProps {
  data: UsedCreditsInPeriodResponse[];
  title: string;
  description: string;
}
function CreditsUserChartWrapper({
  data,
  title,
  description,
}: Readonly<CreditsUserChartWrapperProps>): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <CoinsIcon className="size-6 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <CreditsChart data={data} />
      </CardContent>
    </Card>
  );
}
export default CreditsUserChartWrapper;
