import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  ClientGrpc,
  ClientProxyFactory,
  RpcException,
  Transport,
} from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";
import { Observable, throwError } from "rxjs";
import { catchError, timeout } from "rxjs/operators";
import { GRPC_DEFAULT_OPTIONS } from "../constants/grpc.constants";
import { GrpcOptions } from "../interfaces/grpc-options.interface";
import { TypeConverter } from "../utils/type-converter.util";

@Injectable()
export class BaseGrpcService implements OnModuleInit {
  protected client: ClientGrpc;
  protected service: any;

  constructor(
    private readonly options: GrpcOptions & { service: string },
    private readonly serviceClass: new (...args: any[]) => any,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        ...GRPC_DEFAULT_OPTIONS,
        ...options,
        loader: {
          ...options.loader,
          longs: Number,
          enums: String,
          defaults: true,
          oneofs: true,
        },
      },
    }) as ClientGrpc;
  }

  async onModuleInit(): Promise<void> {
    this.service = this.client.getService<typeof this.serviceClass>(
      this.options.service,
    );
  }

  protected async execute<TRequest extends object, TResponse>(
    method: string,
    data: TRequest,
    metadata?: Record<string, any>,
  ): Promise<TResponse> {
    try {
      const protoMessage = TypeConverter.toProtoMessage(data);
      const result = await (
        this.service[method](protoMessage, metadata) as Observable<any>
      )
        .pipe(
          timeout(this.options.timeout || 5000),
          catchError((error) => throwError(() => this.handleGrpcError(error))),
        )
        .toPromise();

      return TypeConverter.fromProtoMessage<TResponse>(result);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  private handleGrpcError(error: any): never {
    const grpcError = {
      code: error.code || status.INTERNAL,
      message: error.message || "Internal server error",
      details: error.details || "",
    };

    // Log the error for debugging
    console.error("gRPC Error:", {
      code: grpcError.code,
      message: grpcError.message,
      details: grpcError.details,
      stack: error.stack,
    });

    // Map gRPC status codes to appropriate exceptions
    switch (grpcError.code) {
      case status.INVALID_ARGUMENT:
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: "Invalid argument provided",
          details: grpcError.details,
        });
      case status.NOT_FOUND:
        throw new RpcException({
          code: status.NOT_FOUND,
          message: "Resource not found",
          details: grpcError.details,
        });
      case status.ALREADY_EXISTS:
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: "Resource already exists",
          details: grpcError.details,
        });
      case status.PERMISSION_DENIED:
        throw new RpcException({
          code: status.PERMISSION_DENIED,
          message: "Permission denied",
          details: grpcError.details,
        });
      case status.UNAUTHENTICATED:
        throw new RpcException({
          code: status.UNAUTHENTICATED,
          message: "Unauthenticated request",
          details: grpcError.details,
        });
      case status.DEADLINE_EXCEEDED:
        throw new RpcException({
          code: status.DEADLINE_EXCEEDED,
          message: "Request timeout",
          details: grpcError.details,
        });
      default:
        throw new RpcException({
          code: status.INTERNAL,
          message: "Internal server error",
          details: grpcError.details,
        });
    }
  }
}
