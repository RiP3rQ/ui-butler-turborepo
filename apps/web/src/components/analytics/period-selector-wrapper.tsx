import type { Period } from "@repo/types";
import PeriodSelector from "@/components/analytics/period-selector";

export async function PeriodSelectorWrapper({
  selectedPeriod,
  getPeriodsAction,
}: {
  selectedPeriod: Period;
  getPeriodsAction: () => Promise<Period[]>;
}): Promise<JSX.Element> {
  const periods = await getPeriodsAction();
  return <PeriodSelector periods={periods} selectedPeriod={selectedPeriod} />;
}
