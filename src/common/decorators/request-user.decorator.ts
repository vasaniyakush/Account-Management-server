import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenUserPayload } from 'src/modules/user/dto/user.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as TokenUserPayload;
  },
);
