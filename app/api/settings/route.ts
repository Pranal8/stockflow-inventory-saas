export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionContext } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionContext();
    const targetOrgId = session?.organizationId || 'org_demo123';

    let org = await db.organization.findUnique({
      where: { id: targetOrgId }
    });

    if (!org || typeof org !== 'object') {
      org = await db.organization.create({
        data: { 
          id: targetOrgId, 
          name: "My Store", 
          defaultThreshold: 5 
        }
      } as any);
    }

    const runtimeConfig = {
      id: org?.id || targetOrgId,
      name: org?.name || "My Store",
      defaultThreshold: org?.defaultThreshold !== undefined ? Number(org.defaultThreshold) : 5
    };

    return NextResponse.json(runtimeConfig);
  } catch (error: any) {
    console.error("CRITICAL PRODUCTION SETTINGS ACCIDENT:", error);
    return NextResponse.json({ 
      id: 'org_demo123', 
      name: "My Store", 
      defaultThreshold: 5 
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionContext();
    const targetOrgId = session?.organizationId || 'org_demo123';

    const body = await request.json();
    const { defaultThreshold, name } = body;

    const updatedOrg = await db.organization.update({
      where: { id: targetOrgId },
      data: { 
        name: name || "My Store",
        defaultThreshold: parseInt(defaultThreshold) || 5 
      }
    });

    return NextResponse.json({ 
      success: true, 
      organization: {
        id: targetOrgId,
        name: name || "My Store",
        defaultThreshold: parseInt(defaultThreshold) || 5
      } 
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
