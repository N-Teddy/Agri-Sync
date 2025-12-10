import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { SendMailPayload } from 'src/common/third-party/mailer.service';

import { EMAIL_QUEUE, SEND_EMAIL_JOB } from './email.constants';

@Injectable()
export class EmailQueueService {
  constructor(
    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue<SendMailPayload>,
  ) {}

  async enqueueEmail(payload: SendMailPayload): Promise<void> {
    await this.emailQueue.add(SEND_EMAIL_JOB, payload, {
      attempts: 3,
      backoff: 5000,
    });
  }
}
