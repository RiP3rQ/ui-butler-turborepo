/** Available log levels for the application */
export const LOG_LEVELS = {
  INFO: "INFO",
  ERROR: "ERROR",
  WARNING: "WARNING",
  SUCCESS: "SUCCESS",
} as const;

/** Type representing valid log levels */
export type LogLevel = keyof typeof LOG_LEVELS;

/** Console method mappings for each log level */
export const consoleMap: Record<LogLevel, (message: string) => void> = {
  INFO: console.info, // Using console.info instead of console.log for INFO
  ERROR: console.error,
  WARNING: console.warn,
  SUCCESS: console.log,
};

/** Function signature for logging operations */
export type LogFunction = (message: string) => void;

/** Structure representing a single log entry */
export interface Log {
  readonly message: string;
  readonly level: LogLevel;
  readonly timestamp: Date;
}

/** Interface for the log collector implementation */
export type LogCollector = {
  getAll: () => Log[];
} & {
  [level in LogLevel]: LogFunction;
};
