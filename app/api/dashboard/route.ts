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
    });
    const globalThreshold = org?.defaultThreshold ?? 5;

    const products = await db.product.findMany({
      where: { organizationId: session.organizationId },
    });

    const totalProducts = products.length;
    const totalInventoryValue = products.reduce((acc: number, p: any) => acc + (p.quantityOnHand || 0), 0);

    const lowStockItems = products.filter((p: any) => {
      const activeThreshold = p.lowStockLimit !== null && p.lowStockLimit !== undefined ? p.lowStockLimit : globalThreshold;
      return p.quantityOnHand <= activeThreshold;
    });

    return NextResponse.json({
      organizationName: org?.name || 'Your Store',
      globalThreshold,
      metrics: {
        totalProducts,
        totalInventoryValue,
        lowStockCount: lowStockItems.length,
      },
      lowStockItems,
    });
  } catch (error) {
    console.error('Dashboard aggregation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}