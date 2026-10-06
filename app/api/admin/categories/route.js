import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import { categoryCreateSchema } from '@/lib/schemas';
import { validateJsonRequest } from '@/lib/validateRequest';
import { requireAdmin } from '@/lib/requireAdmin';

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 }).lean();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Admin category list error', error);
    return NextResponse.json({ message: 'Unable to load categories.' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { data: body, response } = await validateJsonRequest(request, categoryCreateSchema);
    if (response) return response;
    const { name, type, image, displayOrder } = body;
    const slug = slugify(body.slug || name);
    if (!slug) return NextResponse.json({ message: 'Name and slug are required.' }, { status: 400 });

    await connectToDatabase();
    const category = await Category.create({
      name,
      slug,
      type,
      image,
      displayOrder,
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Admin category create error', error);
    const status = error.name === 'ValidationError' || error.code === 11000 ? 400 : 500;
    return NextResponse.json({ message: error.message || 'Unable to create category.' }, { status });
  }
}
