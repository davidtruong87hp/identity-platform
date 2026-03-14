import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [NotificationController],
})
export class NotificationModule {}
