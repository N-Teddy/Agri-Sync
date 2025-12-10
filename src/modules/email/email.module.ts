import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EMAIL_QUEUE } from './email.constants';
import { MailProcessor } from './mail.processor';
import { EmailQueueService } from './email-queue.service';
import { MailerService } from 'src/common/third-party/mailer.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
  ],
  providers: [MailerService, MailProcessor, EmailQueueService],
  exports: [EmailQueueService],
})
export class EmailModule {}
