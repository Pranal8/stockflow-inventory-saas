import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionContext } from '@/lib/auth';

export async function PUT(request: Request) {
  const session = await getSessionContext();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { defaultThreshold } = await request.json();
    const updatedOrg = await db.organization.update({
      where: { id: session.organizationId },
      data: { defaultThreshold: parseInt(defaultThreshold) || 5 },
    });
    return NextResponse.json(updatedOrg);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update system config parameters.' }, { status: 500 });
  }
}