import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MailService } from '../mail/mail.service';

export interface SendVerificationEmailPayload {
  email: string;
  firstName: string;
  token: string;
}

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly mailService: MailService) {}

  @EventPattern('send_verification_email')
  async handleSendVerificationEmail(
    @Payload() payload: SendVerificationEmailPayload
  ) {
    this.logger.log(
      `Received send_verification_email event for ${payload.email}`
    );
    await this.mailService.sendVerificationEmail(
      payload.email,
      payload.firstName,
      payload.token
    );
  }
}
