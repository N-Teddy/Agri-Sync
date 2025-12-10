import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { EMAIL_QUEUE } from './email.constants';
import { EmailQueueService } from './email-queue.service';
import { MailProcessor } from './mail.processor';
import { MailerService } from '../../common/third-party/mailer.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
  ],
  providers: [MailerService, MailProcessor, EmailQueueService],
  exports: [EmailQueueService],
})
export class EmailModule { }
