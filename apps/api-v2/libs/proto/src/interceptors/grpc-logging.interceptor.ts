// libs/proto/src/interceptors/grpc-logging.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { status } from "@grpc/grpc-js";

@Injectable()
export class GrpcLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GrpcLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rpc = context.switchToRpc();
    const data = rpc.getData();
    const metadata = rpc.getContext();
    const method = context.getHandler().name;
    const service = context.getClass().name;

    const startTime = Date.now();
    this.logger.log({
      type: "gRPC Request",
      service,
      method,
      metadata,
      data,
    });

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;
          this.logger.log({
            type: "gRPC Response",
            service,
            method,
            duration,
            status: status.OK,
            response,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error({
            type: "gRPC Error",
            service,
            method,
            duration,
            error: {
              code: error.code,
              message: error.message,
              details: error.details,
              stack: error.stack,
            },
          });
        },
      }),
    );
  }
}
