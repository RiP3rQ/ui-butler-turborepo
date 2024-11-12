import { UseInterceptors } from '@nestjs/common';
import { ErrorLoggerInterceptor } from './error-logger.interceptor';

export function LogErrors() {
  return UseInterceptors(ErrorLoggerInterceptor);
}
