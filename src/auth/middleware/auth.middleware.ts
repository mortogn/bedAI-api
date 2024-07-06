import { AuthService } from '@/auth/auth.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: Request, res: Response, next: (error?: Error | any) => void) {
    const token = this.extractTokenFromRequest(req);

    if (!token) return next();

    try {
      const payload = await this.authService.veriftyAccessJWT(token);

      req['user'] = { ...payload, id: payload.sub };

      next();
    } catch {
      next();
    }
  }

  extractTokenFromRequest(request: Request) {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
