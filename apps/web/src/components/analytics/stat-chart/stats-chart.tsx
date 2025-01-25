"use client";
import { protoTimestampToDate } from "@/lib/dates";
import type { DailyStats } from "@shared/types";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@shared/ui/components/ui/chart";
import { useMemo, type JSX } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  successful: {
    label: "Successful",
    color: "hsl(var(--chart-1))",
  },
  failed: {
    label: "Failed",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface StatsChartProps {
  data: DailyStats[];
}
function StatsChart({ data }: Readonly<StatsChartProps>): JSX.Element {
  const mappedData = useMemo(() => {
    return data.map((item) => ({
      date: protoTimestampToDate(item.date),
      successful: item.successful,
      failed: item.failed,
    }));
  }, [data]);

  return (
    <ChartContainer className="max-h-[200px] w-full" config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={mappedData}
        height={200}
        margin={{ top: 20 }}
      >
        <CartesianGrid />
        <XAxis
          axisLine={false}
          dataKey="date"
          minTickGap={32}
          tickFormatter={(value: string) => {
            const date = new Date(value);
            return date.toLocaleDateString("pl-PL", {
              month: "short",
              day: "numeric",
            });
          }}
          tickLine={false}
          tickMargin={8}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="successful"
          fill="var(--color-successful)"
          fillOpacity={0.6}
          min={0}
          stackId="1"
          stroke="var(--color-successful)"
          type="bump"
        />
        <Area
          dataKey="failed"
          fill="var(--color-failed)"
          fillOpacity={0.6}
          min={0}
          stackId="1"
          stroke="var(--color-failed)"
          type="bump"
        />
      </AreaChart>
    </ChartContainer>
  );
}
export default StatsChart;
