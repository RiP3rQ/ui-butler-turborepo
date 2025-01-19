// libs/proto/src/interceptors/grpc-validation.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { validate, ValidationError } from "class-validator";
import { plainToClass } from "class-transformer";
import { RpcException } from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";

@Injectable()
export class GrpcValidationInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData();
    const handler = context.getHandler();

    // Get the expected DTO class from handler metadata
    const expectedDto = Reflect.getMetadata("grpcRequestType", handler);
    if (expectedDto) {
      const validationErrors = await this.validateData(data, expectedDto);
      if (validationErrors.length > 0) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: this.formatValidationErrors(validationErrors),
        });
      }
    }

    return next.handle().pipe(
      tap(async (response) => {
        const responseDto = Reflect.getMetadata("grpcResponseType", handler);
        if (responseDto) {
          const validationErrors = await this.validateData(
            response,
            responseDto,
          );
          if (validationErrors.length > 0) {
            throw new RpcException({
              code: status.INTERNAL,
              message: "Response validation failed",
              details: this.formatValidationErrors(validationErrors),
            });
          }
        }
      }),
    );
  }

  private async validateData(data: any, dto: any): Promise<ValidationError[]> {
    if (!data || !dto) return [];
    const transformedData = plainToClass(dto, data);
    return await validate(transformedData, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    });
  }

  private formatValidationErrors(errors: ValidationError[]): string {
    return errors
      .map((error) => Object.values(error.constraints ?? {}))
      .flat()
      .join(", ");
  }
}
