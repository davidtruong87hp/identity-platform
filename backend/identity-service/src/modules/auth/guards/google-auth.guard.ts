import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private state: string | undefined;

  override canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const redirectUri = req.query.redirectUri;

    // Encode redirectUri into state so it survives the OAuth round trip
    if (redirectUri) {
      this.state = Buffer.from(JSON.stringify({ redirectUri })).toString(
        'base64'
      );
    }

    return super.canActivate(context);
  }

  override getAuthenticateOptions() {
    return this.state ? { state: this.state } : {};
  }
}
