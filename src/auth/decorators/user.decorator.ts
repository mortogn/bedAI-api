import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export type JwtPayload = {
  id: string;
  sub: string;
  iat: number;
  exp: number;
};

export const User = createParamDecorator(
  (data: keyof JwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!data) {
      return request.user;
    }

    return request.user ? request.user[data] : undefined;
  },
);
