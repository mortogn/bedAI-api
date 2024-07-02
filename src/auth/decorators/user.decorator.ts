import { ExecutionContext, createParamDecorator } from '@nestjs/common';

type Payload = {
  id: string;
  sub: string;
  iat: number;
  exp: number;
};

export const User = createParamDecorator(
  (data: keyof Payload, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.user ? request.user[data] : undefined;
  },
);
