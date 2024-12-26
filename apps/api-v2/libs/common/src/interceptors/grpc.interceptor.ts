import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { status } from "@grpc/grpc-js";

@Injectable()
export class GrpcErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        const grpcError = {
          code: status.INTERNAL,
          message: err.message,
          details: err.details,
        };

        return throwError(() => grpcError);
      }),
    );
  }
}
