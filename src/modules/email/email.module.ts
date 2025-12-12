import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { MailerService } from '../../common/third-party/mailer.service';
import { AlertEmailService } from './alert-email.service';
import { EMAIL_QUEUE } from './email.constants';
import { EmailQueueService } from './email-queue.service';
import { MailProcessor } from './mail.processor';

@Module({
	imports: [
		BullModule.registerQueue({
			name: EMAIL_QUEUE,
		}),
	],
	providers: [
		MailerService,
		MailProcessor,
		EmailQueueService,
		AlertEmailService,
	],
	exports: [EmailQueueService, AlertEmailService],
})
export class EmailModule { }
