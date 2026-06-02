import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

  
    const user = {
      id: 'usr_' + Math.random().toString(36).substring(2, 11),
      email: email,
      organizationId: 'org_demo123'
    };

    const response = NextResponse.json({ 
      success: true, 
      user: { email: user.email, organizationId: user.organizationId } 
    });

    response.cookies.set('mock_session', JSON.stringify({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId
    }), {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 
    });

    return response;
  } catch (error: any) {
    console.error('LOGIN BYPASS ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}