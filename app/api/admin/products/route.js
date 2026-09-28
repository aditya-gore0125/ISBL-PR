import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { normalizeProductPayload } from '@/lib/adminProduct';
import { requireAdmin } from '@/lib/requireAdmin';

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
    const body = await request.json();
    const payload = normalizeProductPayload(body);
    await connectToDatabase();
    const product = await Product.create(payload);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Admin product create error', error);
    const status = error.name === 'ValidationError' || error.code === 11000 ? 400 : 500;
    return NextResponse.json({ message: error.message || 'Unable to create product.' }, { status });
  }
}
