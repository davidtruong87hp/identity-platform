import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { NotificationClientModule } from '../notification/notification.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({}),
    NotificationClientModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
