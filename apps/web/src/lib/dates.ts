import { endOfMonth, intervalToDuration, startOfMonth } from 'date-fns';
import type { Period } from '@repo/types/analytics.ts';

export function dateToDurationString(start?: Date | null, end?: Date | null) {
  if (!start || !end) {
    return null;
  }

  const timeElapsed = end.getTime() - start.getTime();
  if (timeElapsed < 1000) {
    // Less than a second
    return `${timeElapsed}ms`;
  }

  const duration = intervalToDuration({
    start: 0,
    end: timeElapsed,
  });

  const durationString = [
    duration.minutes ? `${duration.minutes}m` : null,
    duration.seconds ? `${duration.seconds}s` : null,
  ]
    .filter((part) => part !== null)
    .join(" ");

  return durationString;
}

export function periodToDateRange(period: Period) {
  const startDate = startOfMonth(new Date(period.year, period.month - 1));
  const endDate = endOfMonth(new Date(period.year, period.month - 1));

  return { startDate, endDate };
}
