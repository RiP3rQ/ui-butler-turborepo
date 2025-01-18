import { randomUUID } from 'node:crypto';
import { type IncomingMessage, type ServerResponse } from 'node:http';
import { type Request, type Response } from 'express';
import { LoggerModule } from 'nestjs-pino';
import { type Options } from 'pino-http';

interface PinoResponse extends Response {
  responseTime?: number;
}

type CustomRequest = Request & {
  id?: string;
  raw?: {
    body?: unknown;
  };
};

const pinoHttpConfig: Options = {
  transport: {
    target: 'pino-pretty',
    options: {
      singleLine: true,
      colorize: true,
      levelFirst: true,
    },
  },
  genReqId: (req: IncomingMessage): string => {
    return (req as CustomRequest).id || randomUUID();
  },
  autoLogging: true,
  serializers: {
    req: (req: IncomingMessage) => {
      const expressReq = req as CustomRequest;
      return {
        id: expressReq.id,
        method: expressReq.method,
        url: expressReq.url,
        query: expressReq.query,
      };
    },
    res: (res: ServerResponse) => ({
      statusCode: res.statusCode,
    }),
  },
  customProps: (req: IncomingMessage, res: ServerResponse) => ({
    context: 'HTTP',
    responseTime: (res as PinoResponse).responseTime
      ? `${String((res as PinoResponse).responseTime)}ms`
      : undefined,
  }),
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'req.headers["Authentication"]',
      'req.headers["Refresh"]',
    ],
    remove: true,
  },
  customLogLevel: (
    _req: IncomingMessage,
    res: ServerResponse,
    err: Error | undefined,
  ): 'warn' | 'error' | 'silent' | 'info' => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    }
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent';
    }
    return 'info';
  },
  customSuccessMessage: (req: IncomingMessage, res: ServerResponse): string => {
    if (res.statusCode === 404) {
      return 'Resource not found';
    }
    return `${(req as CustomRequest).method} completed`;
  },
  customErrorMessage: (
    req: IncomingMessage,
    _res: ServerResponse,
    err: Error,
  ): string => {
    return `${(req as CustomRequest).method} failed: ${err.message}`;
  },
};

export const loggerConfig = LoggerModule.forRoot({
  pinoHttp: pinoHttpConfig,
});
