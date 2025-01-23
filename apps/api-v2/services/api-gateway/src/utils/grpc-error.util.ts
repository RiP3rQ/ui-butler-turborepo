import { status } from '@grpc/grpc-js';
import { type GrpcError } from '@microservices/common';
import { HttpException, HttpStatus } from '@nestjs/common';

const GRPC_TO_HTTP_STATUS = {
  [status.OK]: HttpStatus.OK,
  [status.CANCELLED]: HttpStatus.NOT_FOUND,
  [status.UNKNOWN]: HttpStatus.INTERNAL_SERVER_ERROR,
  [status.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
  [status.DEADLINE_EXCEEDED]: HttpStatus.GATEWAY_TIMEOUT,
  [status.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [status.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [status.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [status.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
  [status.RESOURCE_EXHAUSTED]: HttpStatus.TOO_MANY_REQUESTS,
  [status.FAILED_PRECONDITION]: HttpStatus.PRECONDITION_FAILED,
  [status.ABORTED]: HttpStatus.CONFLICT,
  [status.OUT_OF_RANGE]: HttpStatus.BAD_REQUEST,
  [status.UNIMPLEMENTED]: HttpStatus.NOT_IMPLEMENTED,
  [status.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
  [status.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [status.DATA_LOSS]: HttpStatus.INTERNAL_SERVER_ERROR,
};

export function handleGrpcError(error: unknown): never {
  // Type guard to check if error is GrpcError
  if (!(error instanceof Error)) {
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Unknown error occurred',
        message: 'Unknown error occurred',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  const grpcError = error as GrpcError;
  const code = grpcError.code ?? status.UNKNOWN;
  const httpStatus = GRPC_TO_HTTP_STATUS[code];

  // Safe access of error properties
  const errorDetails = {
    code: grpcError.code,
    status: httpStatus,
    message: grpcError.message,
    details: grpcError.details,
    metadata: grpcError.metadata,
    stack: grpcError.stack,
  };

  console.error('gRPC Service Error:', errorDetails);

  throw new HttpException(
    {
      statusCode: httpStatus,
      error: grpcError.details,
      message: grpcError.message,
    },
    httpStatus,
  );
}
