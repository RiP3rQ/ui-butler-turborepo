import { endOfMonth, intervalToDuration, startOfMonth } from "date-fns";
import type { Period } from "@repo/types";

export function dateToDurationString(
  start?: string | null,
  end?: string | null,
) {
  if (!start || !end) {
    return null;
  }

  const timeElapsed = new Date(end).getTime() - new Date(start).getTime();
  if (timeElapsed < 1000) {
    // Less than a second
    return `${timeElapsed.toString()}ms`;
  }

  const duration = intervalToDuration({
    start: 0,
    end: timeElapsed,
  });

  return [
    duration.minutes ? `${duration.minutes.toString()}m` : null,
    duration.seconds ? `${duration.seconds.toString()}s` : null,
  ]
    .filter((part) => part !== null)
    .join(" ");
}

export function periodToDateRange(period: Period): {
  startDate: Date;
  endDate: Date;
} {
  const startDate = startOfMonth(new Date(period.year, period.month - 1));
  const endDate = endOfMonth(new Date(period.year, period.month - 1));

  return { startDate, endDate };
}
