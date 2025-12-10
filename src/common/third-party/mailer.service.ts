import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { AppConfiguration } from 'src/config/configuration';

export interface SendMailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailerService {
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService<AppConfiguration>) {
    const mailConfig = this.configService.get<AppConfiguration['mail']>('mail');
    if (!mailConfig) {
      throw new Error('Mail configuration missing');
    }

    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
      },
    });
  }

  async send(payload: SendMailPayload): Promise<void> {
    const mailConfig = this.configService.get<AppConfiguration['mail']>('mail');
    await this.transporter.sendMail({
      from: mailConfig?.from,
      ...payload,
    });
  }
}
