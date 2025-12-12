import { Reflector } from '@nestjs/core';

import { JwtAuthGuard } from '../../../src/common/guards/jwt-auth.guard';

describe('JwtAuthGuard', () => {
	it('allows public routes via metadata', () => {
		const reflector = new Reflector();
		jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
		const guard = new JwtAuthGuard(reflector);
		const canActivate = guard.canActivate({} as never);
		expect(canActivate).toBe(true);
	});

	it('throws when user missing', () => {
		const guard = new JwtAuthGuard(new Reflector());
		expect(() =>
			guard.handleRequest(null as never, null as never)
		).toThrow();
	});

	it('returns user when present', () => {
		const guard = new JwtAuthGuard(new Reflector());
		const user = { sub: 'user-id' };
		expect(guard.handleRequest(null as never, user as never)).toBe(user);
	});
});
