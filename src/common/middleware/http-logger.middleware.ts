import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RequestCustom extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpLoggerMiddleware.name);

  use(req: RequestCustom, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const contentLength = res.get('Content-Length') || 0;
      const logMessage = `${req.ip} ${req.method} ${req.originalUrl} ${res.statusCode} ${contentLength}B ${duration}ms`;

      if (req.user) {
        this.logger.log(
          `${logMessage} > ${req.user.userId} | ${req.user.email}`,
        );
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
