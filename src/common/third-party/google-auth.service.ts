import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { AppConfiguration } from 'src/config/configuration';

export interface GoogleProfile {
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  sub: string;
}

@Injectable()
export class GoogleAuthService {
  private readonly client: OAuth2Client;

  constructor(private readonly configService: ConfigService<AppConfiguration>) {
    const googleConfig = this.configService.get('google');
    if (!googleConfig?.clientId) {
      throw new Error('Google OAuth is not configured');
    }

    this.client = new OAuth2Client(
      googleConfig.clientId,
      googleConfig.clientSecret,
    );
  }

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.configService.get('google')?.clientId,
    });

    const payload = ticket.getPayload() as TokenPayload;
    if (!payload?.email || !payload.sub) {
      throw new Error('Google token payload missing email or subject');
    }

    return {
      email: payload.email,
      emailVerified: Boolean(payload.email_verified),
      name: payload.name ?? undefined,
      picture: payload.picture ?? undefined,
      sub: payload.sub,
    };
  }
}
