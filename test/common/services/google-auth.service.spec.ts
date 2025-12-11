import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

import { GoogleAuthService } from '../../../src/common/third-party/google-auth.service';

describe('GoogleAuthService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('verifies id tokens and returns profile', async () => {
    const mockTicket = {
      getPayload: () => ({
        email: 'google@example.com',
        sub: 'google-sub',
        email_verified: true,
        name: 'Google User',
        picture: 'https://example.com/avatar.png',
      }),
    };

    jest
      .spyOn(OAuth2Client.prototype, 'verifyIdToken')
      .mockResolvedValue(mockTicket as never);

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              google: {
                clientId: 'client-id',
                clientSecret: 'client-secret',
              },
            }),
          ],
        }),
      ],
      providers: [GoogleAuthService],
    }).compile();

    const service = moduleRef.get(GoogleAuthService);
    const profile = await service.verifyIdToken('token');
    expect(profile.email).toBe('google@example.com');
    expect(profile.emailVerified).toBe(true);
  });
});
