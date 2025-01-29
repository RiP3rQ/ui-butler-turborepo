import {
  consoleMap,
  type Log,
  LOG_LEVELS,
  type LogCollector,
  type LogFunction,
  type LogLevel,
} from '@shared/types';

export function createLogCollector(): LogCollector {
  const logs: Log[] = [];

  const getAll = () => logs;

  // Dynamic creation of log functions
  const logFunctions = {} as Record<LogLevel, LogFunction>;
  Object.entries(LOG_LEVELS).forEach(([, level]) => {
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
