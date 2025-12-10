import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EMAIL_QUEUE, SEND_EMAIL_JOB } from './email.constants';
import { SendMailPayload } from 'src/common/third-party/mailer.service';

@Injectable()
export class EmailQueueService {
  constructor(
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue<SendMailPayload>,
  ) {}

  async enqueueEmail(payload: SendMailPayload): Promise<void> {
    await this.emailQueue.add(SEND_EMAIL_JOB, payload, {
      attempts: 3,
      backoff: 5000,
    });
  }
}
