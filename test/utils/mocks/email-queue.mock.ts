import { Injectable } from '@nestjs/common';

import type { SendMailPayload } from '../../../src/common/third-party/mailer.service';

@Injectable()
export class MockEmailQueueService {
  public jobs: SendMailPayload[] = [];

  async enqueueEmail(payload: SendMailPayload): Promise<void> {
    this.jobs.push(payload);
  }
}
