import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const start = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - start) / 1000; // Convert to seconds
          const response = http.getResponse();
          const route = request.route?.path || request.url;

          this.metricsService.recordHttpRequest(
            request.method,
            route,
            response.statusCode,
            duration,
          );
        },
        error: (error) => {
          const duration = (Date.now() - start) / 1000;
          const route = request.route?.path || request.url;
          const statusCode = error.status || 500;

          this.metricsService.recordHttpRequest(
            request.method,
            route,
            statusCode,
            duration,
          );
        },
      }),
    );
  }
}
