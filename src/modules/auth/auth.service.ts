// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { TokenUserPayload } from '../user/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(user: User): { accessToken: string } {
    const payload = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  verifyToken(token: string): TokenUserPayload | null {
    try {
      return this.jwtService.verify(token) as TokenUserPayload;
    } catch (e) {
      return null;
    }
  }
}
