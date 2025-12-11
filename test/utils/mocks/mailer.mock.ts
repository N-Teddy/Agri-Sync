import { Injectable } from '@nestjs/common';

import type { SendMailPayload } from '../../../src/common/third-party/mailer.service';

@Injectable()
export class MockMailerService {
  public sent: SendMailPayload[] = [];

  async send(payload: SendMailPayload): Promise<void> {
    this.sent.push(payload);
  }
}
