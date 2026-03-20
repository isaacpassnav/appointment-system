import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import {
  buildAppointmentConfirmationTemplate,
  buildAppointmentReminderTemplate,
  buildVerifyEmailTemplate,
  buildWelcomeTemplate,
} from './templates';

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
  private transporter: Transporter | null = null;

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

  async sendAppointmentConfirmationEmail(
    to: string,
    fullName: string,
    startsAtIso: string,
  ) {
    const template = buildAppointmentConfirmationTemplate(
      fullName,
      startsAtIso,
    );
    await this.send({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendAppointmentReminderEmail(
    to: string,
    fullName: string,
    startsAtIso: string,
    reminderOffsetHours: 24 | 1,
  ) {
    const template = buildAppointmentReminderTemplate(
      fullName,
      startsAtIso,
      reminderOffsetHours,
    );
    await this.send({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  private async send(payload: MailPayload) {
    const auditRecipients = parseAuditRecipients(
      this.configService.get<string>('RESEND_AUDIT_EMAILS') ??
        this.configService.get<string>('RESEND_AUDIT_EMAIL'),
    ).filter((email) => email !== payload.to.toLowerCase());

    if (this.isSmtpConfigured()) {
      try {
        await this.sendViaSmtp(payload, auditRecipients);
        return;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `SMTP send failed for ${payload.to}. Falling back to Resend if available. Reason: ${message}`,
        );
      }
    }

    await this.sendViaResend(payload, auditRecipients);
  }

  private isSmtpConfigured() {
    return Boolean(
      this.configService.get<string>('SMTP_HOST') &&
      this.configService.get<string>('SMTP_USER') &&
      this.configService.get<string>('SMTP_PASS'),
    );
  }

  private getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const portRaw = this.configService.get<string>('SMTP_PORT') ?? '587';
    const port = Number(portRaw);
    const secure = port === 465;

    if (!host || !user || !pass || !Number.isFinite(port)) {
      throw new Error(
        'SMTP configuration is incomplete. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      requireTLS: !secure,
      auth: {
        user,
        pass,
      },
      tls: {
        minVersion: 'TLSv1.2',
      },
    });

    return this.transporter;
  }

  private async sendViaSmtp(payload: MailPayload, auditRecipients: string[]) {
    const transporter = this.getTransporter();
    const from =
      this.configService.get<string>('SMTP_FROM') ??
      this.configService.get<string>('RESEND_FROM_EMAIL') ??
      'onboarding@resend.dev';

    await transporter.sendMail({
      from,
      to: payload.to,
      bcc: auditRecipients.length > 0 ? auditRecipients : undefined,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  }

  private async sendViaResend(payload: MailPayload, auditRecipients: string[]) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const from =
      this.configService.get<string>('RESEND_FROM_EMAIL') ??
      this.configService.get<string>('SMTP_FROM') ??
      'onboarding@resend.dev';

    if (!apiKey) {
      this.logger.warn(
        `SMTP and Resend are not fully configured. Email to ${payload.to} was skipped.`,
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
