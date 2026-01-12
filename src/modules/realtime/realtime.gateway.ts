import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Server, Socket } from 'socket.io';

import type { AppConfiguration } from '../../config/configuration';

interface JwtPayload {
	sub?: string;
	email?: string;
}

@WebSocketGateway({
	path: '/ws',
	cors: {
		origin: true,
		credentials: true,
	},
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	private readonly server!: Server;

	private readonly logger = new Logger(RealtimeGateway.name);
	private readonly userRoomPrefix = 'user:';

	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<AppConfiguration>
	) {}

	async handleConnection(client: Socket) {
		const token = this.extractToken(client);
		if (!token) {
			this.logger.warn('WebSocket connection rejected: missing token.');
			client.disconnect(true);
			return;
		}

		try {
			const jwtConfig = this.configService.get<AppConfiguration['jwt']>('jwt');
			const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
				secret: jwtConfig?.secret,
			});
			if (!payload?.sub) {
				throw new Error('Token missing subject');
			}
			client.data.userId = payload.sub;
			client.join(`${this.userRoomPrefix}${payload.sub}`);
			this.logger.debug(`WebSocket connected for user ${payload.sub}`);
		} catch (error) {
			this.logger.warn('WebSocket connection rejected: invalid token.');
			client.disconnect(true);
		}
	}

	handleDisconnect(client: Socket) {
		const userId = client.data?.userId as string | undefined;
		if (userId) {
			this.logger.debug(`WebSocket disconnected for user ${userId}`);
		}
	}

	emitAlert(userId: string, payload: Record<string, unknown>) {
		this.server
			.to(`${this.userRoomPrefix}${userId}`)
			.emit('alert.created', payload);
	}

	private extractToken(client: Socket): string | undefined {
		const authToken = client.handshake.auth?.token;
		if (typeof authToken === 'string' && authToken.length > 0) {
			return authToken;
		}
		const queryToken = client.handshake.query?.token;
		if (Array.isArray(queryToken)) {
			return queryToken[0];
		}
		if (typeof queryToken === 'string' && queryToken.length > 0) {
			return queryToken;
		}
		return undefined;
	}
}
