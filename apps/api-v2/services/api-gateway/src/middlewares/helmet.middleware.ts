import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

@Injectable()
export class HelmetMiddleware implements NestMiddleware {
  public use(req: Request, res: Response, next: NextFunction) {
    // Skip Helmet for metrics endpoint
    if (req.path === '/api/metrics') {
      next();
      return;
    }

    // Apply Helmet for all other routes
    helmet()(req, res, next);
  }
}
