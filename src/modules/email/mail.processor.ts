import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';

import {
	MailerService,
	SendMailPayload,
} from '../../common/third-party/mailer.service';
import { EMAIL_QUEUE, SEND_EMAIL_JOB } from './email.constants';

@Processor(EMAIL_QUEUE)
@Injectable()
export class MailProcessor {
	private readonly logger = new Logger(MailProcessor.name);

	constructor(private readonly mailerService: MailerService) {}

	@Process(SEND_EMAIL_JOB)
	async handleSendMail(job: Job<SendMailPayload>): Promise<void> {
		this.logger.debug(`Sending email to ${job.data.to}`);
		await this.mailerService.send(job.data);
	}
}
