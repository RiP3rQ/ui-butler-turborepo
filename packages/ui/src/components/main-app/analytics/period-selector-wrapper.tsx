import type { Period } from '@repo/types/analytics.ts';
import PeriodSelector from '@repo/ui/components/main-app/analytics/period-selector.tsx';

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
