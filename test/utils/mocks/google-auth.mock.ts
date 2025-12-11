import { Injectable } from '@nestjs/common';

import type { GoogleProfile } from '../../../src/common/third-party/google-auth.service';

@Injectable()
export class MockGoogleAuthService {
  private profiles: Record<string, GoogleProfile> = {};

  setProfile(idToken: string, profile: GoogleProfile) {
    this.profiles[idToken] = profile;
  }

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    const profile = this.profiles[idToken];
    if (!profile) {
      throw new Error('Unknown Google token');
    }
    return profile;
  }
}
