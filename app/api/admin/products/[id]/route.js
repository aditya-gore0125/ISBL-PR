import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { normalizeProductPayload } from '@/lib/adminProduct';
import { requireAdmin } from '@/lib/requireAdmin';
import { productUpdateSchema } from '@/lib/schemas';
import { validateJsonRequest } from '@/lib/validateRequest';
import { getSizeOptions } from '@/lib/sizeConfig';
import { slugify } from '@/lib/slugify';

function invalidId(error) {
  return error?.name === 'CastError';
}

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const product = await Product.findById(params.id).lean();
    if (!product) return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    if (invalidId(error)) return NextResponse.json({ message: 'Invalid product id.' }, { status: 400 });
    console.error('Admin product get error', error);
    return NextResponse.json({ message: 'Unable to load product.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { data, response } = await validateJsonRequest(request, productUpdateSchema);
    if (response) return response;
    if (!Object.keys(data).length) return NextResponse.json({ message: 'No product changes were provided.' }, { status: 400 });
    await connectToDatabase();
    const existing = await Product.findById(params.id).lean();
    if (!existing) return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    const merged = { ...existing, ...data };
    const categoryChanged = data.type !== undefined && data.type !== existing.type
      || data.category !== undefined && data.category !== existing.category;
    if (data.sizes === undefined && categoryChanged && getSizeOptions(merged.type, merged.category)) {
      return NextResponse.json({ message: 'Stock for every available size is required when changing product category.' }, { status: 400 });
    }
    const updateData = { type: merged.type, category: merged.category, ...data };
    if (typeof data.slug === 'string') updateData.slug = slugify(data.slug);
    const payload = normalizeProductPayload(updateData, { partial: true });
    if (data.sizes === undefined && categoryChanged && !getSizeOptions(merged.type, merged.category)) payload.sizes = [];
    if (payload.sizes === undefined && existing.sizes?.length) payload.stock = existing.stock;
    const product = await Product.findByIdAndUpdate(params.id, payload, { new: true, runValidators: true }).lean();
    if (!product) return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    if (invalidId(error)) return NextResponse.json({ message: 'Invalid product id.' }, { status: 400 });
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A product with this slug already exists. Change the name or slug.' }, { status: 409 });
    }
    const status = error.status || (error.name === 'ValidationError' ? 400 : 500);
    console.error('Admin product update error', error);
    return NextResponse.json({ message: error.message || 'Unable to update product.' }, { status });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const product = await Product.findByIdAndDelete(params.id).lean();
    if (!product) return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    return NextResponse.json({ message: 'Product deleted.' });
  } catch (error) {
    if (invalidId(error)) return NextResponse.json({ message: 'Invalid product id.' }, { status: 400 });
    console.error('Admin product delete error', error);
    return NextResponse.json({ message: 'Unable to delete product.' }, { status: 500 });
  }
}
