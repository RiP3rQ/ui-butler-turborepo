export const LogLevels = ["INFO", "ERROR", "WARNING", "SUCCESS"] as const;
export type LogLevel = (typeof LogLevels)[number];

export const consoleMap: Record<LogLevel, (message: string) => void> = {
  INFO: console.log,
  ERROR: console.error,
  WARNING: console.warn,
  SUCCESS: console.log,
};

export type LogFunction = (message: string) => void;

export type Log = {
  message: string;
  level: LogLevel;
  timestamp: Date;
};

export type LogCollector = {
  getAll(): Log[];
} & {
  [level in LogLevel]: LogFunction;
};
