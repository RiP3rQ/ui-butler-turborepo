"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Period } from "@repo/types/src/analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

const MONTHS_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

interface PeriodSelectorProps {
  periods: Period[];
  selectedPeriod: Period;
}
function PeriodSelector({
  periods,
  selectedPeriod,
}: Readonly<PeriodSelectorProps>): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <Select
      onValueChange={(value) => {
        console.log(value);
        const [month, year] = value.split("-");
        const params = new URLSearchParams(searchParams);
        params.set("month", month);
        params.set("year", year);
        router.push(`?${params.toString()}`);
      }}
      value={`${selectedPeriod.month}-${selectedPeriod.year}`}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {periods.map((period, index) => (
          <SelectItem key={index} value={`${period.month}-${period.year}`}>
            {`${MONTHS_NAMES[period.month - 1]} ${period.year}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export default PeriodSelector;
