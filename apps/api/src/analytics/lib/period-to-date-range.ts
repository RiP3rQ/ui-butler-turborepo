import { endOfMonth, startOfMonth } from 'date-fns';
import type { Period } from '@repo/types';

export function periodToDateRange(period: Period) {
  const startDate = startOfMonth(new Date(period.year, period.month - 1));
  const endDate = endOfMonth(new Date(period.year, period.month - 1));

  return { startDate, endDate };
}
