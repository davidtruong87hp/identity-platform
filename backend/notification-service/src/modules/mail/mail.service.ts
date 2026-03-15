import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
    });
  }

  private compileTemplate(
    templateName: string,
    context: Record<string, any>
  ): string {
    const templatePath = path.join(
      process.cwd(),
      'backend/notification-service/src/modules/mail/templates',
      `${templateName}.hbs`
    );
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);
    return template(context);
  }

  async sendVerificationEmail(
    to: string,
    firstName: string,
    token: string
  ): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL');
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    const html = this.compileTemplate('verify-email', {
      firstName,
      verifyUrl,
    });

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to,
      subject: 'Verify your email address',
      html,
    });

    this.logger.log(`Verification email sent to ${to}`);
  }

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    token: string
  ): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL');
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const html = this.compileTemplate('reset-password', {
      firstName,
      resetUrl,
    });

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to,
      subject: 'Reset your password',
      html,
    });

    this.logger.log(`Password reset email sent to ${to}`);
  }
}
