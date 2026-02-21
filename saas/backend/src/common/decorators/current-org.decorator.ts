import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentOrg = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const orgId = request.user?.orgId || request.headers['x-org-id'];
    if (!orgId) {
      throw new Error('Organization context required');
    }
    return orgId;
  },
);
