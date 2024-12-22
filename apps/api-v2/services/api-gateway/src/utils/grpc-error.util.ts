import { HttpException, HttpStatus } from '@nestjs/common';
import { status } from '@grpc/grpc-js';

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

export function handleGrpcError(error: any): never {
  const httpStatus =
    GRPC_TO_HTTP_STATUS[error.code] || HttpStatus.INTERNAL_SERVER_ERROR;

  console.error('gRPC Service Error:', {
    code: error.code,
    status: httpStatus,
    message: error.message,
    details: error.details,
    metadata: error.metadata,
    stack: error.stack,
  });

  throw new HttpException(
    {
      statusCode: httpStatus,
      error: error.details || error.message,
      message: error.message,
    },
    httpStatus,
  );
}
