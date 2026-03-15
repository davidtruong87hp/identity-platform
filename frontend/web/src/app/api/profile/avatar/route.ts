import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    const buffer = Buffer.from(await file.arrayBuffer());
    const form = new FormData();
    form.append('file', buffer, {
      filename: file.name,
      contentType: file.type,
    });

    const res = await axios.post(
      `${process.env.API_URL}/profile/avatar`,
      form,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...form.getHeaders(),
        },
      }
    );
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.response?.data?.message ?? 'Failed to upload avatar' },
      { status: err.response?.status ?? 500 }
    );
  }
}
