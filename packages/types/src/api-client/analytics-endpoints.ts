/**
 * Analytics API response types
 */

import { type Period } from "../analytics";

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
