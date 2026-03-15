import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const appUrl = process.env.APP_URL ?? 'http://localhost:3004';

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', appUrl));
  }

  const response = NextResponse.redirect(new URL('/profile', appUrl));

  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/',
  });

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return response;
}
