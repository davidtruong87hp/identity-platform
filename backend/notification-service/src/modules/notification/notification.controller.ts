import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MailService } from '../mail/mail.service';

export interface SendVerificationEmailPayload {
  email: string;
  firstName: string;
  token: string;
}

export interface SendPasswordResetEmailPayload {
  email: string;
  firstName: string;
  token: string;
}

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly mailService: MailService) {}

  @EventPattern('user.registered')
  async handleSendVerificationEmail(
    @Payload() payload: SendVerificationEmailPayload
  ) {
    this.logger.log(`Received user.registered event for ${payload.email}`);
    await this.mailService.sendVerificationEmail(
      payload.email,
      payload.firstName,
      payload.token
    );
  }

  @EventPattern('user.password_reset_requested')
  async handlePasswordResetRequested(
    @Payload() payload: SendPasswordResetEmailPayload
  ) {
    this.logger.log(
      `Received user.password_reset_requested event for ${payload.email}`
    );
    await this.mailService.sendPasswordResetEmail(
      payload.email,
      payload.firstName,
      payload.token
    );
  }
}
