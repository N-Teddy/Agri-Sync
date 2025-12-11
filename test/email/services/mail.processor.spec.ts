import { Test } from '@nestjs/testing';

import { MailProcessor } from '../../../src/modules/email/mail.processor';
import { MailerService } from '../../../src/common/third-party/mailer.service';

describe('MailProcessor', () => {
  it('delegates sending email to mailer service', async () => {
    const send = jest.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        MailProcessor,
        { provide: MailerService, useValue: { send } },
      ],
    }).compile();

    const processor = moduleRef.get(MailProcessor);
    await processor.handleSendMail({
      data: { to: 'processor@example.com', subject: 'Hello', html: '<p>Body</p>' },
    } as never);

    expect(send).toHaveBeenCalledWith({
      to: 'processor@example.com',
      subject: 'Hello',
      html: '<p>Body</p>',
    });
  });
});
