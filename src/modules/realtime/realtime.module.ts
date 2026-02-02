import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';

import type { AppConfiguration } from '../../config/configuration';
import { RealtimeGateway } from './realtime.gateway';

@Module({
	imports: [
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService<AppConfiguration>) => {
				const jwtConfig =
					configService.get<AppConfiguration['jwt']>('jwt');
				if (!jwtConfig) {
					throw new Error('JWT configuration missing');
				}
				const expiresIn = jwtConfig.expiresIn as any;
				return {
					secret: jwtConfig.secret,
					signOptions: {
						expiresIn,
					},
				};
			},
		}),
	],
	providers: [RealtimeGateway],
	exports: [RealtimeGateway],
})
export class RealtimeModule { }
