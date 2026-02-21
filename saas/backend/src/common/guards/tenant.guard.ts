import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orgHeader = request.headers['x-org-id'];

    if (!user) return true; // Auth guard handles unauthenticated

    const orgId = user.orgId || orgHeader;
    if (!orgId) {
      throw new ForbiddenException('Organization context required');
    }
    request.orgId = orgId;
    return true;
  }
}
