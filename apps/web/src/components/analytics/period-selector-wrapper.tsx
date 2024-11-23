import type { Period } from "@repo/types/src/analytics";
import PeriodSelector from "@/components/analytics/period-selector.tsx";

export async function PeriodSelectorWrapper({
  selectedPeriod,
  getPeriodsAction,
}: {
  selectedPeriod: Period;
  getPeriodsAction: () => Promise<Period[]>;
}) {
  const periods = await getPeriodsAction();
  return <PeriodSelector periods={periods} selectedPeriod={selectedPeriod} />;
}
