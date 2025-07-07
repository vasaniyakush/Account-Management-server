import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import * as morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';

interface RequestCustom extends Request {
  user?: {
    userId: string;
    email: string;
  };
}
const logger = (morgan as any).default || morgan;

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpLoggerMiddleware.name);

  use(req: RequestCustom, res: Response, next: NextFunction) {
    logger(
      ':remote-addr :method :url :status :res[content-length] :response-time ms',
      {
        stream: {
          write: (message: any) => {
            if (req?.user) {
              this.logger.log(
                `${message} > ${req.user?.userId} | ${req.user?.email}`.replace(
                  /(\r\n|\n|\r)/gm,
                  '',
                ),
              );
            } else {
              this.logger.log(message);
            }
          },
        },
      },
    )(req, res, next);
  }
}
