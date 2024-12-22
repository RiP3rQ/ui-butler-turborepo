import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { GrpcValidationInterceptor } from "../interceptors/grpc-validation.interceptor";

export function GrpcMethodWithValidation(service: string, method?: string) {
  return applyDecorators(
    GrpcMethod(service, method),
    UseInterceptors(GrpcValidationInterceptor),
  );
}
