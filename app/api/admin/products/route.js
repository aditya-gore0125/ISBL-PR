import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { normalizeProductPayload } from '@/lib/adminProduct';
import { requireAdmin } from '@/lib/requireAdmin';
import { productCreateSchema } from '@/lib/schemas';
import { validateJsonRequest } from '@/lib/validateRequest';
import { slugify } from '@/lib/slugify';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Admin product list error', error);
    return NextResponse.json({ message: 'Unable to load products.' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { data, response } = await validateJsonRequest(request, productCreateSchema);
    if (response) return response;
    const payload = normalizeProductPayload({ ...data, slug: slugify(data.slug) });
    await connectToDatabase();
    const product = await Product.create(payload);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A product with this slug already exists. Change the name or slug.' }, { status: 409 });
    }
    console.error('Admin product create error', error);
    const status = error.status || (error.name === 'ValidationError' ? 400 : 500);
    return NextResponse.json({ message: error.message || 'Unable to create product.' }, { status });
  }
}
