import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { TokenUserPayload } from '../user/dto/user.dto';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    const payload: TokenUserPayload | null =
      this.authService.verifyToken(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    req['user'] = payload; // attach payload to request
    next();
  }
}
