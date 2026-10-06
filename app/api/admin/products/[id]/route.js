import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { normalizeProductPayload } from '@/lib/adminProduct';
import { requireAdmin } from '@/lib/requireAdmin';
import { productUpdateSchema } from '@/lib/schemas';
import { validateJsonRequest } from '@/lib/validateRequest';

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
    const payload = normalizeProductPayload(data, { partial: true });
    await connectToDatabase();
    const product = await Product.findByIdAndUpdate(params.id, payload, { new: true, runValidators: true }).lean();
    if (!product) return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    if (invalidId(error)) return NextResponse.json({ message: 'Invalid product id.' }, { status: 400 });
    const status = error.name === 'ValidationError' || error.code === 11000 ? 400 : 500;
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
