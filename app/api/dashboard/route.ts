import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionContext } from '@/lib/auth';

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch organization details to get the dynamic global threshold
    const org = await db.organization.findUnique({
      where: { id: session.organizationId },
    });
    const globalThreshold = org?.defaultThreshold ?? 5;

    // 2. Fetch all products belonging to this tenant
    const products = await db.product.findMany({
      where: { organizationId: session.organizationId },
    });

    // 3. Compute metric aggregations
    const totalProducts = products.length;
    const totalInventoryValue = products.reduce((acc: number, p: any) => acc + (p.quantityOnHand || 0), 0);

    // 4. Filter products matching low stock criteria
    const lowStockItems = products.filter((p: any) => {
      // Use specific product threshold limit override if set, otherwise fall back to global organization threshold
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