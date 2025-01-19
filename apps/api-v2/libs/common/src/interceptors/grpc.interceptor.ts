import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { status } from "@grpc/grpc-js";

interface GrpcError {
  code: status;
  message: string;
  details?: unknown;
}

@Injectable()
export class GrpcErrorInterceptor implements NestInterceptor<unknown, unknown> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((err) => {
        const grpcError: GrpcError = {
          code: status.INTERNAL,
          message: err instanceof Error ? err.message : String(err),
          details:
            err instanceof Error
              ? (err as { details?: unknown }).details
              : undefined,
        };

        return throwError(() => grpcError);
      }),
    );
  }
}
