export type Period = {
  year: number;
  month: number;
};

export type StatCardsValuesResponse = {
  workflowExecutions: number;
  creditsConsumed: number;
  phasesExecuted: number;
};

export type UsedCreditsInPeriodResponse = {
  successful: number;
  failed: number;
  date: string;
};
