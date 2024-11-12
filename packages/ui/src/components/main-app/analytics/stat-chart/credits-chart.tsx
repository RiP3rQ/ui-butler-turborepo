"use client";
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import type { UsedCreditsInPeriodResponse } from '@repo/types/analytics.ts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@repo/ui/components/ui/chart';

const chartConfig = {
  successful: {
    label: "Successful",
    color: "hsl(var(--chart-2))",
  },
  failed: {
    label: "Failed",
    color: "hsl(var(--chart-1))",
  },
};

interface CreditsChartProps {
  data: UsedCreditsInPeriodResponse[];
}
function CreditsChart({ data }: Readonly<CreditsChartProps>): JSX.Element {
  return (
    <ChartContainer className="max-h-[200px] w-full" config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={data}
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
        <Bar
          dataKey="successful"
          fill="var(--color-successful)"
          fillOpacity={0.8}
          radius={[0, 0, 4, 4]}
          stackId="1"
          stroke="var(--color-successful)"
        />
        <Bar
          dataKey="failed"
          fill="var(--color-failed)"
          fillOpacity={0.8}
          radius={[4, 4, 0, 0]}
          stackId="1"
          stroke="var(--color-failed)"
        />
      </BarChart>
    </ChartContainer>
  );
}
export default CreditsChart;
