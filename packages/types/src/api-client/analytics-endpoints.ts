/**
 * Analytics API response types
 */

export interface StatCard {
  title: string;
  value: number;
  change: number;
  trend: "up" | "down" | "neutral";
}

export interface WorkflowStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
}

export interface CreditStats {
  used: number;
  remaining: number;
  total: number;
}

export interface DashboardStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
}

export interface FavoritedComponent {
  id: number;
  name: string;
  type: string;
  usageCount: number;
  lastUsed: string;
}

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

export interface DashboardStatCardsValuesResponse {
  currentActiveProjects: number;
  numberOfCreatedComponents: number;
  favoritesComponents: number;
}

export interface DashboardGridValuesResponse {
  iconId: number;
  name: string;
  color: string;
  numberOfComponents: number;
}

export interface DashboardTableFavoritedContentResponse {
  id: number;
  name: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  // TODO: DISPLAY CHECKMARKS FOR THE WORKFLOW TYPES THAT ARE DONE TO THE COMPONENT (e.g. "Tests", "TestsE2E", "Ts docs")
}

/**
 * Analytics API endpoint definitions
 */
export interface AnalyticsEndpoints {
  /** GET /analytics/periods */
  getPeriods: {
    response: Period[];
  };

  /** GET /analytics/stat-cards-values */
  getStatCardsValues: {
    query: {
      month: number;
      year: number;
    };
    response: {
      cards: StatCard[];
    };
  };

  /** GET /analytics/workflow-execution-stats */
  getWorkflowExecutionStats: {
    query: {
      month: number;
      year: number;
    };
    response: WorkflowStats;
  };

  /** GET /analytics/used-credits-in-period */
  getUsedCreditsInPeriod: {
    query: {
      month: number;
      year: number;
    };
    response: CreditStats;
  };

  /** GET /analytics/dashboard-stat-cards-values */
  getDashboardStatCardsValues: {
    response: DashboardStats;
  };

  /** GET /analytics/favorited-table-content */
  getFavoritedTableContent: {
    response: FavoritedComponent[];
  };
}
