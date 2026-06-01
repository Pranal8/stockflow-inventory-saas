import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionContext } from '@/lib/auth';

// GET: Fetch all products for the logged-in user's organization
export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const products = await db.product.findMany({
      where: { organizationId: session.organizationId },
    });

    return NextResponse.json(products || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new product scoped to the organization
export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockLimit } = body;

    if (!name || !sku) {
      return NextResponse.json({ error: 'Name and SKU are required' }, { status: 400 });
    }

    // Check SKU uniqueness strictly within this organization
    const existingSku = await db.product.findUnique({
      where: {
        organizationId_sku: {
          organizationId: session.organizationId,
          sku: sku,
        },
      },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: 'A product with this SKU already exists in your organization' }, 
        { status: 400 }
      );
    }

    // Create the product record
    const newProduct = await db.product.create({
      data: {
        organizationId: session.organizationId,
        name,
        sku,
        description,
        quantityOnHand,
        costPrice,
        sellingPrice,
        lowStockLimit,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}