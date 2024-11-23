import type { ExecutionPhase } from '@repo/types';

type Phase = Pick<ExecutionPhase, 'creditsCost'>;

export function getPhasesTotalCost(phases: Phase[]): number {
  return phases.reduce((acc, phase) => acc + (phase.creditsCost ?? 0), 0);
}
