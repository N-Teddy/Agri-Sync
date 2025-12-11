import { Test } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';

import { EmailQueueService } from '../../../src/modules/email/email-queue.service';
import { EMAIL_QUEUE, SEND_EMAIL_JOB } from '../../../src/modules/email/email.constants';

describe('EmailQueueService', () => {
  it('enqueues email jobs with retries', async () => {
    const add = jest.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        EmailQueueService,
        { provide: getQueueToken(EMAIL_QUEUE), useValue: { add } },
      ],
    }).compile();

    const service = moduleRef.get(EmailQueueService);
    await service.enqueueEmail({
      to: 'queue@example.com',
      subject: 'Hello',
      html: '<p>Body</p>',
    });

    expect(add).toHaveBeenCalledWith(
      SEND_EMAIL_JOB,
      expect.objectContaining({ to: 'queue@example.com' }),
      expect.objectContaining({ attempts: 3, backoff: 5000 }),
    );
  });
});
