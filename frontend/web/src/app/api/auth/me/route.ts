import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

async function tryRefresh(refreshToken: string) {
  const res = await axios.post(`${process.env.API_URL}/auth/refresh`, {
    refreshToken,
  });
  return res.data; // { accessToken, refreshToken }
}

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value;
  const refreshToken = req.cookies.get('refresh_token')?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Try fetching profile with current access token
  if (accessToken) {
    try {
      const res = await axios.get(`${process.env.API_URL}/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return NextResponse.json(res.data);
    } catch (err: any) {
      // If it's not a 401, something else went wrong — bail out
      if (err.response?.status !== 401) {
        return NextResponse.json(
          { message: err.response?.data?.message ?? 'Failed to fetch profile' },
          { status: err.response?.status ?? 500 }
        );
      }
      // If 401 — fall through to refresh logic below
    }
  }

  // Access token expired or missing — try refreshing
  if (!refreshToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tokens = await tryRefresh(refreshToken);

    // Retry fetching profile with new access token
    const profileRes = await axios.get(`${process.env.API_URL}/profile`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });

    const response = NextResponse.json(profileRes.data);

    // Set both new cookies since refresh token is rotated
    response.cookies.set('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    response.cookies.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    // Refresh token is invalid or expired — force logout
    const response = NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }
}
