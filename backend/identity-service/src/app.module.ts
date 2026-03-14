import { Module } from '@nestjs/common';
import { AppConfigModule } from './modules/config/config.module';
import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { StorageModule } from './modules/storage/storage.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    StorageModule,
    UserModule,
    AuthModule,
    ProfileModule,
  ],
})
export class AppModule {}
