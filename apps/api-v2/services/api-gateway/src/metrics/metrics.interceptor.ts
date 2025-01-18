import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { type Request, type Response } from 'express';
import { MetricsService } from './metrics.service';

interface RouteInfo {
  path?: string;
}

// @ts-expect-error - gRpc request does not have route
interface RequestWithRoute extends Request {
  route?: RouteInfo;
  method: string;
  url: string;
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const start = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithRoute>();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - start) / 1000; // Convert to seconds
          const response = http.getResponse<Response>();
          const route = request.route?.path ?? request.url;

          this.metricsService.recordHttpRequest(
            request.method,
            route,
            response.statusCode,
            duration,
          );
        },
        error: (error: HttpException | Error) => {
          const duration = (Date.now() - start) / 1000;
          const route = request.route?.path ?? request.url;
          const statusCode =
            error instanceof HttpException ? error.getStatus() : 500;

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
