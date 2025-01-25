"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Period } from "@shared/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import { type JSX } from "react";

const MONTHS_NAMES: readonly string[] = [
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
];

interface PeriodSelectorProps {
  periods: Period[];
  selectedPeriod: Period;
}

export function PeriodSelector({
  periods,
  selectedPeriod,
}: Readonly<PeriodSelectorProps>): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <Select
      onValueChange={(value: string) => {
        const [month, year] = value.split("-");
        if (!year || !month) {
          return;
        }
        const params = new URLSearchParams(searchParams);
        params.set("month", month);
        params.set("year", year);
        router.push(`?${params.toString()}`);
      }}
      value={`${String(selectedPeriod.month)}-${String(selectedPeriod.year)}`}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {periods.map((period) => (
          <SelectItem
            key={`${String(period.year)}-${String(period.month)}`}
            value={`${String(period.month)}-${String(period.year)}`}
          >
            {`${MONTHS_NAMES[period.month - 1] ?? ""} ${String(period.year)}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
