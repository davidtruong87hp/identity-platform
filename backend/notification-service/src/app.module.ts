import { Module } from '@nestjs/common';
import { AppConfigModule } from './modules/config/config.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [AppConfigModule, NotificationModule],
})
export class AppModule {}
