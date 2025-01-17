export interface Period {
  year: number;
  month: number;
}

export interface StatCardsValuesResponse {
  workflowExecutions: number;
  creditsConsumed: number;
  phasesExecuted: number;
}

export interface UsedCreditsInPeriodResponse {
  successful: number;
  failed: number;
  date: string;
}
