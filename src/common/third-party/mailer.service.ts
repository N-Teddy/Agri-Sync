import { Injectable, Logger } from '@nestjs/common';
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
    const app = this.configService.get<AppConfiguration['app']>('app');
    const isProduction = app?.env === 'production';
    if (!mailConfig) {
      throw new Error('Mail configuration missing');
    }

    if (!isProduction) {
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        ignoreTLS: true, // MailDev doesn't use TLS
      });
      Logger.log('MailerService configured to use MailDev on localhost:1025');
    } else {
      this.transporter = nodemailer.createTransport({
        host: mailConfig.host,
        port: mailConfig.port,
        auth: {
          user: mailConfig.user,
          pass: mailConfig.pass,
        },
      });
    }
  }

  async send(payload: SendMailPayload): Promise<void> {
    const mailConfig = this.configService.get<AppConfiguration['mail']>('mail');
    await this.transporter.sendMail({
      from: mailConfig?.from,
      ...payload,
    });
  }
}
