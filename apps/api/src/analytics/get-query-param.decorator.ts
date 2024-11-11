import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const QueryParam = createParamDecorator(
  (data: string, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const queryParams = request.query;
    return data ? queryParams[data] : undefined;
  },
);
