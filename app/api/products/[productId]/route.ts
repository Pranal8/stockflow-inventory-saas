import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionContext } from '@/lib/auth';

export async function PUT(request: Request, context: any) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const params = await context.params;
    const productId = params?.productId; 

    if (!productId) {
      return NextResponse.json({ error: 'Missing product ID parameter' }, { status: 400 });
    }

    const body = await request.json();
    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockLimit } = body;

    const existingProduct = await db.product.findFirst({
      where: { id: productId, organizationId: session.organizationId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found inside this tenant' }, { status: 404 });
    }

    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: {
        name: name ?? existingProduct.name,
        sku: sku ?? existingProduct.sku,
        description: description !== undefined ? description : existingProduct.description,
        quantityOnHand: quantityOnHand !== undefined ? parseInt(quantityOnHand) : existingProduct.quantityOnHand,
        costPrice: costPrice !== undefined ? (costPrice ? parseFloat(costPrice) : null) : existingProduct.costPrice,
        sellingPrice: sellingPrice !== undefined ? (sellingPrice ? parseFloat(sellingPrice) : null) : existingProduct.sellingPrice,
        lowStockLimit: lowStockLimit !== undefined ? (lowStockLimit ? parseInt(lowStockLimit) : null) : existingProduct.lowStockLimit,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const params = await context.params;
    const productId = params?.productId;

    if (!productId) {
      return NextResponse.json({ error: 'Missing product ID parameter' }, { status: 400 });
    }

    const existingProduct = await db.product.findFirst({
      where: { id: productId, organizationId: session.organizationId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found inside this tenant' }, { status: 404 });
    }

    await db.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}