import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import type { RequestUser } from '../../src/common/decorators/current-user.decorator';

@Injectable()
export class TestRequestContext {
  user: RequestUser = {
    sub: 'test-user-id',
    email: 'test@example.com',
  };
}

@Injectable()
export class MockJwtAuthGuard implements CanActivate {
  constructor(private readonly context: TestRequestContext) { }

  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
    request.user = this.context.user;
    return true;
  }
}
