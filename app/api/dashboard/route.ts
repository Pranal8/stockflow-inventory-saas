import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionContext } from '@/lib/auth';

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const org = await db.organization.findUnique({
      where: { id: session.organizationId },
      select: { defaultThreshold: true },
    });

    const globalThreshold = org?.defaultThreshold ?? 5;

    // 2. Fetch all products belonging to this tenant
    const products = await db.product.findMany({
      where: { organizationId: session.organizationId },
    });

    const totalProducts = products.length;
    const totalInventoryCount = products.reduce((sum:any, p:any) => sum + p.quantityOnHand, 0);

    const lowStockItems = products.filter((p:any) => {
      const threshold = p.lowStockLimit !== null ? p.lowStockLimit : globalThreshold;
      return p.quantityOnHand <= threshold;
    }).map((p:any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantityOnHand: p.quantityOnHand,
      threshold: p.lowStockLimit !== null ? p.lowStockLimit : globalThreshold,
    }));

    return NextResponse.json({
      totalProducts,
      totalInventoryCount,
      lowStockItems,
    });
  } catch (error) {
    console.error('Dashboard analytical fetch failure:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}