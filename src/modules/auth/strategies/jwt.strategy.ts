import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfiguration } from '../../../config/configuration';

export interface JwtPayload {
	sub: string;
	email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService<AppConfiguration>
	) {
		const jwtConfig = configService.get<AppConfiguration['jwt']>('jwt');
		if (!jwtConfig) {
			throw new Error('JWT configuration missing');
		}
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtConfig.secret,
		});
	}

	validate(payload: JwtPayload): JwtPayload {
		return payload;
	}
}
