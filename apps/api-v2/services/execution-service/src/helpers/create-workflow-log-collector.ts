import {
  consoleMap,
  Log,
  LogCollector,
  LogFunction,
  LogLevel,
  LogLevels,
} from '@repo/types';

export function createLogCollector(): LogCollector {
  const logs: Log[] = [];

  const getAll = () => logs;

  // Dynamic creation of log functions
  const logFunctions = {} as Record<LogLevel, LogFunction>;
  LogLevels.forEach((level) => {
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
