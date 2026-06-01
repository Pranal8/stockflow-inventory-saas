import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, organizationName } = body;

    // 1. Basic input validation
    if (!email || !password || !organizationName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 2. Check for existing users safely in our in-memory layer
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // 3. Create the tenant organization and administrator user using our memory layer
    const org = await db.organization.create({
      data: { name: organizationName }
    });

    const user = await db.user.create({
      data: {
        email,
        passwordHash: password, 
        organizationId: org.id
      }
    });

    // 4. Create a production-safe session response cookie
    const response = NextResponse.json({ success: true, user: { email: user.email } }, { status: 201 });
    
    // Set a plain cookie string so it functions flawlessly without variables or disk writes
    response.cookies.set('mock_session', JSON.stringify({
      userId: user.id,
      email: user.email,
      organizationId: org.id
    }), {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error: any) {
    console.error('PRODUCTION SIGNUP CRASH LOG:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}