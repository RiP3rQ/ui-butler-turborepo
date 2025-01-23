import {
  DATABASE_CONNECTION,
  type NeonDatabaseType,
  sql,
} from '@microservices/database';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Gauge, Registry } from 'prom-client';

interface TableRow extends Record<string, unknown> {
  table_name: string;
  schemaname: string;
  row_count: string | number;
  dead_rows: string | number;
  seq_scan: string | number;
  idx_scan: string | number;
}

interface QueryStats extends Record<string, unknown> {
  xact_commit: string | number;
  xact_rollback: string | number;
  blks_read: string | number;
  blks_hit: string | number;
  tup_returned: string | number;
  tup_fetched: string | number;
  tup_inserted: string | number;
  tup_updated: string | number;
  tup_deleted: string | number;
}

@Injectable()
export class DatabaseStatsService {
  private readonly logger = new Logger(DatabaseStatsService.name);
  private readonly registry: Registry;

  private dbSizeGauge: Gauge;
  private activeConnectionsGauge: Gauge;
  private queryStatsGauge: Gauge;
  private tableRowsGauge: Gauge;

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonDatabaseType,
  ) {
    this.registry = new Registry();
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    this.dbSizeGauge = new Gauge({
      name: 'neon_database_size_bytes',
      help: 'Neon database size in bytes',
      labelNames: ['database'],
      registers: [this.registry],
    });

    this.activeConnectionsGauge = new Gauge({
      name: 'neon_active_connections',
      help: 'Number of active connections',
      registers: [this.registry],
    });

    this.queryStatsGauge = new Gauge({
      name: 'neon_query_stats',
      help: 'Query statistics',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.tableRowsGauge = new Gauge({
      name: 'neon_table_rows',
      help: 'Number of rows in tables',
      labelNames: ['table', 'schema', 'type'],
      registers: [this.registry],
    });
  }

  public async collectDatabaseMetrics(): Promise<void> {
    try {
      const startTime = Date.now();

      await Promise.all([
        this.collectDatabaseSize(),
        this.collectActiveConnections(),
        this.collectTableStats(),
        this.collectQueryStats(),
      ]);

      const duration = Date.now() - startTime;
      this.logger.debug(
        `Metrics collection completed in ${String(duration)}ms`,
      );
    } catch (error) {
      this.logger.error('Failed to collect Neon database metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  private async collectDatabaseSize(): Promise<void> {
    try {
      const result = await this.db.execute(sql`
        SELECT pg_database_size(current_database()) as size;
      `);

      if (result.rows[0]?.size) {
        const size = this.parseMetricValue(result.rows[0].size);
        this.dbSizeGauge.set({ database: 'neondb' }, size);
        this.logger.debug(`Database size collected: ${String(size)} bytes`);
      }
    } catch (error) {
      this.logger.warn('Failed to collect database size', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async collectActiveConnections(): Promise<void> {
    try {
      const result = await this.db.execute(sql`
          SELECT numbackends
          FROM pg_stat_database
          WHERE datname = current_database();
      `);

      if (result.rows[0]?.numbackends) {
        const connections = this.parseMetricValue(result.rows[0].numbackends);
        this.activeConnectionsGauge.set(connections);
        this.logger.debug(
          `Active connections collected: ${String(connections)}`,
        );
      }
    } catch (error) {
      this.logger.warn('Failed to collect active connections', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async collectTableStats(): Promise<void> {
    try {
      const result = await this.db.execute(sql`
          SELECT schemaname,
                 relname    as table_name,
                 n_live_tup as row_count,
                 n_dead_tup as dead_rows,
                 seq_scan,
                 idx_scan
          FROM pg_stat_user_tables;
      `);

      if (result.rows.length > 0) {
        result.rows.forEach((row: Record<string, unknown>) => {
          // Type assertion after validation
          if (this.isTableRow(row)) {
            const tableName = String(row.table_name);
            const schemaName = String(row.schemaname);

            // Live rows
            this.tableRowsGauge.set(
              { table: tableName, schema: schemaName, type: 'live' },
              this.parseMetricValue(row.row_count),
            );

            // Dead rows
            this.tableRowsGauge.set(
              { table: tableName, schema: schemaName, type: 'dead' },
              this.parseMetricValue(row.dead_rows),
            );

            // Scans
            this.tableRowsGauge.set(
              { table: tableName, schema: schemaName, type: 'seq_scan' },
              this.parseMetricValue(row.seq_scan),
            );
            this.tableRowsGauge.set(
              { table: tableName, schema: schemaName, type: 'idx_scan' },
              this.parseMetricValue(row.idx_scan),
            );
          }
        });
      }
    } catch (error) {
      this.logger.warn('Failed to collect table statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async collectQueryStats(): Promise<void> {
    try {
      const result = await this.db.execute(sql`
          SELECT xact_commit,
                 xact_rollback,
                 blks_read,
                 blks_hit,
                 tup_returned,
                 tup_fetched,
                 tup_inserted,
                 tup_updated,
                 tup_deleted
          FROM pg_stat_database
          WHERE datname = current_database();
      `);

      if (result.rows[0]) {
        const row = result.rows[0];
        if (this.isQueryStats(row)) {
          const metrics = {
            transactions_committed: row.xact_commit,
            transactions_rolled_back: row.xact_rollback,
            blocks_read: row.blks_read,
            blocks_hit: row.blks_hit,
            tuples_returned: row.tup_returned,
            tuples_fetched: row.tup_fetched,
            tuples_inserted: row.tup_inserted,
            tuples_updated: row.tup_updated,
            tuples_deleted: row.tup_deleted,
          };

          Object.entries(metrics).forEach(([key, value]) => {
            this.queryStatsGauge.set(
              { type: key },
              this.parseMetricValue(value),
            );
          });
        }
      }
    } catch (error) {
      this.logger.warn('Failed to collect query statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Type guards
  private isTableRow(row: Record<string, unknown>): row is TableRow {
    return (
      typeof row.table_name === 'string' &&
      typeof row.schemaname === 'string' &&
      row.row_count !== undefined &&
      row.dead_rows !== undefined &&
      row.seq_scan !== undefined &&
      row.idx_scan !== undefined
    );
  }

  private isQueryStats(row: Record<string, unknown>): row is QueryStats {
    return (
      row.xact_commit !== undefined &&
      row.xact_rollback !== undefined &&
      row.blks_read !== undefined &&
      row.blks_hit !== undefined &&
      row.tup_returned !== undefined &&
      row.tup_fetched !== undefined &&
      row.tup_inserted !== undefined &&
      row.tup_updated !== undefined &&
      row.tup_deleted !== undefined
    );
  }

  private parseMetricValue(value: unknown): number {
    if (value === null || value === undefined) return 0;
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  public async getMetrics(): Promise<string> {
    try {
      await this.collectDatabaseMetrics();
      const metrics = await this.registry.metrics();
      this.logger.debug('Generated metrics:', metrics);
      return metrics;
    } catch (error) {
      this.logger.error('Failed to get metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
