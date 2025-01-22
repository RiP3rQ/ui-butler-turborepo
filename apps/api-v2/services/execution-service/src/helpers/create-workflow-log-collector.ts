import {
  consoleMap,
  type Log,
  type LogCollector,
  type LogFunction,
  type LogLevel,
  LOG_LEVELS,
} from '@repo/types';

export function createLogCollector(): LogCollector {
  const logs: Log[] = [];

  const getAll = () => logs;

  // Dynamic creation of log functions
  const logFunctions = {} as Record<LogLevel, LogFunction>;
  Object.entries(LOG_LEVELS).forEach(([_, level]) => {
    logFunctions[level] = (message: string) => {
      logs.push({ level, message, timestamp: new Date() });
      consoleMap[level](message);
    };
  });

  return {
    getAll,
    ...logFunctions,
  };
}
