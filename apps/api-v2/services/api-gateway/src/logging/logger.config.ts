import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

export const loggerConfig = LoggerModule.forRoot({
  pinoHttp: {
    transport: {
      target: 'pino-pretty',
      options: {
        singleLine: true,
        colorize: true,
        levelFirst: true,
      },
    },
    genReqId: function (req) {
      return req.id ?? randomUUID();
    },
    autoLogging: true,
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
      }),
      // FOR BODY DEBBUGING
      // req(req) {
      //   req.body = req.raw.body;
      //   return req;
      // },
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
    customProps: (req, res: any) => ({
      context: 'HTTP',
      responseTime: res.responseTime ? `${res.responseTime}` : undefined,
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
    customLogLevel: function (req, res, err) {
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
    customSuccessMessage: function (req, res) {
      if (res.statusCode === 404) {
        return 'Resource not found';
      }
      return `${req.method} completed`;
    },
    customErrorMessage: function (req, res, err) {
      return `${req.method} failed: ${err.message}`;
    },
  },
});
