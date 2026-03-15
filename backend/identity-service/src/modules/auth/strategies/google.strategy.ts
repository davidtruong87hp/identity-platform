import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  redirectUri?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
      passReqToCallback: true, // ← allows us to read state from the request
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    // Decode redirectUri from state param
    let redirectUri: string | undefined;
    try {
      if (req.query.state) {
        const state = JSON.parse(
          Buffer.from(req.query.state, 'base64').toString()
        );
        redirectUri = state.redirectUri;
      }
    } catch {
      // invalid state, ignore
    }

    const user: GoogleProfile = {
      id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      avatarUrl: photos[0].value,
      redirectUri,
    };

    done(null, user);
  }
}
