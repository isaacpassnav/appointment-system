import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildVerifyEmailTemplate, buildWelcomeTemplate } from './templates';

type MailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function parseAuditRecipients(rawValue?: string) {
  return (rawValue ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendWelcomeEmail(to: string, fullName: string) {
    const template = buildWelcomeTemplate(fullName);
    await this.send({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendVerifyEmail(to: string, fullName: string, verifyUrl: string) {
    const template = buildVerifyEmailTemplate(fullName, verifyUrl);
    await this.send({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  private async send(payload: MailPayload) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const from =
      this.configService.get<string>('RESEND_FROM_EMAIL') ??
      'onboarding@resend.dev';
    const auditRecipients = parseAuditRecipients(
      this.configService.get<string>('RESEND_AUDIT_EMAILS') ??
        this.configService.get<string>('RESEND_AUDIT_EMAIL'),
    ).filter((email) => email !== payload.to.toLowerCase());

    if (!apiKey) {
      this.logger.warn(
        `RESEND_API_KEY is not configured. Email to ${payload.to} was skipped.`,
      );
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        bcc: auditRecipients.length > 0 ? auditRecipients : undefined,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend API error (${response.status}): ${body}`);
    }
  }
}
