import { Module } from '@nestjs/common';
import { AppConfigModule } from './modules/config/config.module';
import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, UserModule],
})
export class AppModule {}
