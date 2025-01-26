// import { Request, Response } from 'express';
// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpException,
//   HttpStatus,
//   Logger,
// } from '@nestjs/common';

// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   private readonly logger = new Logger(HttpExceptionFilter.name);

//   public catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     const status =
//       exception instanceof HttpException
//         ? exception.getStatus()
//         : HttpStatus.INTERNAL_SERVER_ERROR;

//     const errorResponse = {
//       statusCode: status,
//       timestamp: new Date().toISOString(),
//       path: request.url,
//       method: request.method,
//       message: exception.message || 'Internal server error',
//     };

//     this.logger.error(
//       `${request.method} ${request.url}`,
//       JSON.stringify(errorResponse),
//     );

//     response.status(status).json(errorResponse);
//   }
// }
