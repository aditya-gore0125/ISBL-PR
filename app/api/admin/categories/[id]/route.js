import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/requireAdmin';

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function invalidId(error) {
  return error?.name === 'CastError';
}

export async function PUT(request, { params }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const payload = {};
    if (typeof body.name === 'string') payload.name = body.name.trim();
    if (typeof body.slug === 'string' || body.name) payload.slug = slugify(body.slug || body.name);
    if (typeof body.image === 'string') payload.image = body.image.trim();
    if (typeof body.type === 'undefined' || ['Ladies', 'Gents'].includes(body.type)) payload.type = body.type;
    if (typeof body.displayOrder !== 'undefined') payload.displayOrder = Number(body.displayOrder);

    if (payload.name === '') return NextResponse.json({ message: 'Name cannot be empty.' }, { status: 400 });
    if (payload.slug === '') return NextResponse.json({ message: 'Slug cannot be empty.' }, { status: 400 });
    if (payload.type === undefined) delete payload.type;
    if ('displayOrder' in payload && !Number.isFinite(payload.displayOrder)) return NextResponse.json({ message: 'Display order must be a number.' }, { status: 400 });
    if (body.type && !['Ladies', 'Gents'].includes(body.type)) return NextResponse.json({ message: 'Category type is invalid.' }, { status: 400 });

    await connectToDatabase();
    const category = await Category.findByIdAndUpdate(params.id, payload, { new: true, runValidators: true }).lean();
    if (!category) return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    return NextResponse.json({ category });
  } catch (error) {
    if (invalidId(error)) return NextResponse.json({ message: 'Invalid category id.' }, { status: 400 });
    const status = error.name === 'ValidationError' || error.code === 11000 ? 400 : 500;
    console.error('Admin category update error', error);
    return NextResponse.json({ message: error.message || 'Unable to update category.' }, { status });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const category = await Category.findByIdAndDelete(params.id).lean();
    if (!category) return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    return NextResponse.json({ message: 'Category deleted.' });
  } catch (error) {
    if (invalidId(error)) return NextResponse.json({ message: 'Invalid category id.' }, { status: 400 });
    console.error('Admin category delete error', error);
    return NextResponse.json({ message: 'Unable to delete category.' }, { status: 500 });
  }
}
