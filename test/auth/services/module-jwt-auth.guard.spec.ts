import { Reflector } from '@nestjs/core';

import { JwtAuthGuard } from '../../../src/modules/auth/jwt-auth.guard';

describe('Modules/Auth JwtAuthGuard', () => {
  it('permits public endpoints', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const guard = new JwtAuthGuard(reflector);
    expect(guard.canActivate({} as never)).toBe(true);
  });

  it('throws when user missing', () => {
    const guard = new JwtAuthGuard(new Reflector());
    expect(() =>
      guard.handleRequest(null, null, undefined, undefined, undefined),
    ).toThrow();
  });

  it('returns request user', () => {
    const guard = new JwtAuthGuard(new Reflector());
    const user = { sub: 'user' };
    expect(guard.handleRequest(null, user, undefined, undefined, undefined)).toBe(
      user,
    );
  });
});
