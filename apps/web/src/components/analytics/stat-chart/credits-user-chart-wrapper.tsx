import CreditsChart from "@/components/analytics/stat-chart/credits-chart";
import type { UsedCreditsInPeriod } from "@shared/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/ui/components/ui/card";
import { CoinsIcon } from "lucide-react";
import { type JSX } from "react";

interface CreditsUserChartWrapperProps {
  data: UsedCreditsInPeriod[];
  title: string;
  description: string;
}

export function CreditsUserChartWrapper({
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
