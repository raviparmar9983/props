import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  otpLoginEmail,
  passwordResetEmail,
  builderVerifiedEmail,
  builderRejectedEmail,
  projectApprovedEmail,
  projectRejectedEmail,
  newLeadEmail,
  emailVerificationEmail,
} from './mail.templates';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;

  constructor(private config: ConfigService) {
    this.from = config.get<string>('SMTP_FROM', 'PropertiesWale <no-reply@propertieswale.com>');
  }

  onModuleInit() {
    const host = this.config.get<string>('SMTP_HOST');
    if (!host) {
      this.logger.warn('SMTP_HOST not set. Emails will be logged instead of sent.');
      return;
    }
    this.transporter = nodemailer.createTransport({
      host,
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    const expiryMinutes = this.config.get<number>('OTP_EXPIRY_MINUTES', 5);
    const { subject, html } = otpLoginEmail(otp, expiryMinutes);
    await this.send(to, subject, html);
  }

  async sendPasswordResetEmail(to: string, otp: string): Promise<void> {
    const expiryMinutes = this.config.get<number>('OTP_EXPIRY_MINUTES', 5);
    const { subject, html } = passwordResetEmail(otp, expiryMinutes);
    await this.send(to, subject, html);
  }

  async sendBuilderVerified(to: string, companyName: string): Promise<void> {
    const { subject, html } = builderVerifiedEmail(companyName);
    await this.send(to, subject, html);
  }

  async sendBuilderRejected(to: string, companyName: string, reason: string): Promise<void> {
    const { subject, html } = builderRejectedEmail(companyName, reason);
    await this.send(to, subject, html);
  }

  async sendProjectApproved(to: string, projectTitle: string, city: string, locality: string): Promise<void> {
    const { subject, html } = projectApprovedEmail(projectTitle, city, locality);
    await this.send(to, subject, html);
  }

  async sendProjectRejected(to: string, projectTitle: string, reason: string): Promise<void> {
    const { subject, html } = projectRejectedEmail(projectTitle, reason);
    await this.send(to, subject, html);
  }

  async sendNewLead(to: string, projectTitle: string, customerName: string, customerEmail: string, customerPhone: string | undefined, interest: string, leadId?: string, timestamp?: string): Promise<void> {
    const { subject, html } = newLeadEmail(projectTitle, customerName, customerEmail, customerPhone, interest, leadId, timestamp);
    await this.send(to, subject, html);
  }

  async sendEmailVerification(to: string, otp: string): Promise<void> {
    const expiryMinutes = this.config.get<number>('OTP_EXPIRY_MINUTES', 5);
    const { subject, html } = emailVerificationEmail(otp, expiryMinutes);
    await this.send(to, subject, html);
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[DEV] Email to ${to} — Subject: ${subject}`);
      this.logger.log(`[DEV] HTML length: ${html.length} chars`);
      return;
    }
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
        headers: {
          'X-Mailer': 'PropertiesWale',
        },
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
    }
  }
}
