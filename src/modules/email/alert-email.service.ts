import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppConfiguration } from '../../config/configuration';
import { Alert } from '../../entities/alert.entity';
import { User } from '../../entities/user.entity';
import { EmailQueueService } from './email-queue.service';
import { getAlertEmailTemplate } from './templates/email-templates';

@Injectable()
export class AlertEmailService {
    private readonly logger = new Logger(AlertEmailService.name);

    constructor(
        private readonly emailQueueService: EmailQueueService,
        private readonly configService: ConfigService<AppConfiguration>
    ) { }

    async sendAlertEmail(alert: Alert, user: User): Promise<void> {
        try {
            // Only send for high severity alerts
            if (alert.severity !== 'high') {
                return;
            }

            const appConfig =
                this.configService.get<AppConfiguration['app']>('app');
            const dashboardUrl = `${appConfig?.webUrl}/dashboard`;

            const html = getAlertEmailTemplate({
                userName: user.fullName || user.email.split('@')[0],
                alertTitle: alert.title,
                alertMessage: alert.message,
                severity: alert.severity,
                fieldName: alert.field?.name || 'Unknown Field',
                triggeredAt: new Date(alert.triggeredAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                }),
                dashboardUrl,
            });

            await this.emailQueueService.enqueueEmail({
                to: user.email,
                subject: `⚠️ High Priority Alert: ${alert.title}`,
                html,
                text: `Alert: ${alert.title}\n\n${alert.message}\n\nField: ${alert.field?.name}\nSeverity: ${alert.severity}\n\nView your dashboard: ${dashboardUrl}`,
            });

            this.logger.log(
                `Alert email sent to ${user.email} for alert ${alert.id}`
            );
        } catch (error) {
            this.logger.error(
                `Failed to send alert email: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    async sendBatchAlertEmails(
        alerts: Array<{ alert: Alert; user: User }>
    ): Promise<void> {
        const promises = alerts.map(({ alert, user }) =>
            this.sendAlertEmail(alert, user)
        );

        await Promise.allSettled(promises);
    }
}
