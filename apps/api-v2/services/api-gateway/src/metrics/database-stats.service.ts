import { Inject, Injectable, Logger } from '@nestjs/common';
import { DATABASE_CONNECTION, type NeonDatabaseType } from '@app/database';
import { sql } from 'drizzle-orm';
import { Counter, Gauge, Registry } from 'prom-client';

@Injectable()
export class DatabaseStatsService {
  private readonly logger = new Logger(DatabaseStatsService.name);
  private readonly registry: Registry;

  // Database size
  private dbSizeGauge: Gauge<string>;

  // Connection metrics
  private connectionGauge: Gauge<string>;

  // Transaction metrics
  private transactionCounter: Counter<string>;

  // Query metrics
  private queryExecutionGauge: Gauge<string>;

  // Table metrics
  private tableStatsGauge: Gauge<string>;

  // Index metrics
  private indexStatsGauge: Gauge<string>;

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NeonDatabaseType,
  ) {
    this.registry = new Registry();
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // Database size metric
    this.dbSizeGauge = new Gauge({
      name: 'postgres_database_size_bytes',
      help: 'Database size in bytes',
      labelNames: ['database'],
      registers: [this.registry],
    });

    // Connection metrics
    this.connectionGauge = new Gauge({
      name: 'postgres_connections',
      help: 'Number of active connections',
      labelNames: ['state'],
      registers: [this.registry],
    });

    // Transaction metrics
    this.transactionCounter = new Counter({
      name: 'postgres_transactions_total',
      help: 'Total number of transactions',
      labelNames: ['type'],
      registers: [this.registry],
    });

    // Query execution metrics
    this.queryExecutionGauge = new Gauge({
      name: 'postgres_query_execution_time_ms',
      help: 'Query execution time statistics',
      labelNames: ['type'],
      registers: [this.registry],
    });

    // Table statistics
    this.tableStatsGauge = new Gauge({
      name: 'postgres_table_stats',
      help: 'Table statistics',
      labelNames: ['table', 'type'],
      registers: [this.registry],
    });

    // Index statistics
    this.indexStatsGauge = new Gauge({
      name: 'postgres_index_stats',
      help: 'Index statistics',
      labelNames: ['table', 'index', 'type'],
      registers: [this.registry],
    });
  }

  async collectDatabaseMetrics(): Promise<void> {
    try {
      await Promise.all([
        this.collectDatabaseSize(),
        this.collectConnectionStats(),
        this.collectQueryStats(),
        this.collectTableStats(),
        this.collectIndexStats(),
      ]);
    } catch (error) {
      this.logger.error('Failed to collect database metrics', error);
    }
  }

  private async collectDatabaseSize() {
    const query = sql`
        SELECT pg_database_size(current_database()) as size;
    `;

    const result = await this.db.execute(query);
    if (result[0]) {
      this.dbSizeGauge.set({ database: 'current' }, result[0].size);
    }
  }

  private async collectConnectionStats() {
    const query = sql`
        SELECT state, count(*) as count
        FROM pg_stat_activity
        GROUP BY state;
    `;

    const results = await this.db.execute(query);
    if (Array.isArray(results)) {
      results.forEach((row: any) => {
        this.connectionGauge.set({ state: row.state || 'unknown' }, row.count);
      });
    }
  }

  private async collectQueryStats() {
    const query = sql`
        SELECT calls,
               total_exec_time,
               mean_exec_time, rows
        FROM pg_stat_statements
        WHERE dbid = (SELECT oid FROM pg_database WHERE datname = current_database());
    `;

    const results = await this.db.execute(query);
    if (results[0]) {
      this.queryExecutionGauge.set(
        { type: 'mean_exec_time' },
        results[0].mean_exec_time,
      );
      this.queryExecutionGauge.set(
        { type: 'total_exec_time' },
        results[0].total_exec_time,
      );
    }
  }

  private async collectTableStats() {
    const query = sql`
        SELECT schemaname,
               relname as table_name,
               seq_scan,
               seq_tup_read,
               idx_scan,
               n_tup_ins,
               n_tup_upd,
               n_tup_del,
               n_live_tup,
               n_dead_tup
        FROM pg_stat_user_tables;
    `;

    const results = await this.db.execute(query);
    if (Array.isArray(results)) {
      results.forEach((row) => {
        const labels = { table: row.table_name };
        this.tableStatsGauge.set({ ...labels, type: 'seq_scan' }, row.seq_scan);
        this.tableStatsGauge.set({ ...labels, type: 'idx_scan' }, row.idx_scan);
        this.tableStatsGauge.set({ ...labels, type: 'inserts' }, row.n_tup_ins);
        this.tableStatsGauge.set({ ...labels, type: 'updates' }, row.n_tup_upd);
        this.tableStatsGauge.set({ ...labels, type: 'deletes' }, row.n_tup_del);
        this.tableStatsGauge.set(
          { ...labels, type: 'live_tuples' },
          row.n_live_tup,
        );
        this.tableStatsGauge.set(
          { ...labels, type: 'dead_tuples' },
          row.n_dead_tup,
        );
      });
    }
  }

  private async collectIndexStats() {
    const query = sql`
        SELECT schemaname,
               relname      as table_name,
               indexrelname as index_name,
               idx_scan,
               idx_tup_read,
               idx_tup_fetch
        FROM pg_stat_user_indexes;
    `;

    const results = await this.db.execute(query);
    if (Array.isArray(results)) {
      results.forEach((row: any) => {
        const labels = { table: row.table_name, index: row.index_name };
        this.indexStatsGauge.set({ ...labels, type: 'scans' }, row.idx_scan);
        this.indexStatsGauge.set(
          { ...labels, type: 'tuples_read' },
          row.idx_tup_read,
        );
        this.indexStatsGauge.set(
          { ...labels, type: 'tuples_fetched' },
          row.idx_tup_fetch,
        );
      });
    }
  }

  async getMetrics(): Promise<string> {
    await this.collectDatabaseMetrics();
    return await this.registry.metrics();
  }
}
