import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, organizationName } = body;

    if (!email || !password || !organizationName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }


    const org = await db.organization.create({ data: { name: organizationName } });
    const user = await db.user.create({
      data: { email, passwordHash: password, organizationId: org.id }
    });

    const response = NextResponse.json({ success: true, user: { email: user.email } }, { status: 201 });
    
   response.cookies.set('mock_session', JSON.stringify({
      userId: user.id,
      email: user.email,
      organizationId: org.id
    }), {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}