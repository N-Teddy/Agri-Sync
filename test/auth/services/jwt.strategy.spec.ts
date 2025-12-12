import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import type { JwtPayload } from '../../../src/modules/auth/strategies/jwt.strategy';
import { JwtStrategy } from '../../../src/modules/auth/strategies/jwt.strategy';

describe('JwtStrategy', () => {
	it('returns payload on validate', async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					load: [
						() => ({
							jwt: {
								secret: 'secret',
							},
						}),
					],
				}),
			],
			providers: [JwtStrategy],
		}).compile();

		const strategy = moduleRef.get(JwtStrategy);
		const payload: JwtPayload = {
			sub: 'user-id',
			email: 'user@example.com',
		};
		expect(strategy.validate(payload)).toEqual(payload);
	});
});
