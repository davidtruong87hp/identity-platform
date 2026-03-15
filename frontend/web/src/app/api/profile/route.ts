import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function PATCH(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  try {
    const res = await axios.patch(`${process.env.API_URL}/profile`, body, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.response?.data?.message ?? 'Failed to update profile' },
      { status: err.response?.status ?? 500 }
    );
  }
}
