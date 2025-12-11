import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import nodemailer from 'nodemailer';

import { MailerService } from '../../../src/common/third-party/mailer.service';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('MailerService', () => {
  it('sends emails via configured transporter', async () => {
    const sendMail = jest.fn().mockResolvedValue(undefined);
    const createTransportSpy = jest
      .spyOn(nodemailer, 'createTransport')
      .mockReturnValue({ sendMail } as never);

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              app: { env: 'development' },
              mail: {
                host: 'smtp.example.com',
                port: 1025,
                user: 'user',
                pass: 'pass',
                from: 'noreply@example.com',
              },
            }),
          ],
        }),
      ],
      providers: [MailerService],
    }).compile();

    const service = moduleRef.get(MailerService);
    await service.send({
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Body</p>',
    });

    expect(createTransportSpy).toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledWith({
      from: 'noreply@example.com',
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Body</p>',
      text: undefined,
    });
  });
});
