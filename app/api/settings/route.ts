import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionContext } from '@/lib/auth';

// GET: Fetch current organization configuration settings
export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const org = await db.organization.findUnique({
      where: { id: session.organizationId },
    });
    return NextResponse.json(org);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update organization configuration settings
export async function PUT(request: Request) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { defaultThreshold, name } = body;

    const updatedOrg = await db.organization.update({
      where: { id: session.organizationId },
      data: {
        name: name,
        defaultThreshold: defaultThreshold,
      },
    });

    return NextResponse.json(updatedOrg);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}