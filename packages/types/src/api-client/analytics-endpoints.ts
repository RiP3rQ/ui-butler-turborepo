/**
 * Analytics API response types
 */

import type { ProtoTimestamp } from "../others/proto-timestamp";

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
  usageCount: number; // TODO: Remove this field
  lastUsed: string; // TODO: Remove this field
  id: number;
  name: string;
  projectName: string;
  createdAt: ProtoTimestamp;
  updatedAt: ProtoTimestamp;
  // TODO: DISPLAY CHECKMARKS FOR THE WORKFLOW TYPES THAT ARE DONE TO THE COMPONENT (e.g. "Tests", "TestsE2E", "Ts docs")
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

export interface DailyStats {
  date: ProtoTimestamp;
  successful: number;
  failed: number;
}

export interface UsedCreditsInPeriod {
  stats: DailyStats[];
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
    response: StatCardsValuesResponse;
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
    response: UsedCreditsInPeriod;
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
