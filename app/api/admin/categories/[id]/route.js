import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/requireAdmin';
import { categoryUpdateSchema } from '@/lib/schemas';
import { validateJsonRequest } from '@/lib/validateRequest';
import { slugify } from '@/lib/slugify';

function invalidId(error) {
  return error?.name === 'CastError';
}

export async function PUT(request, { params }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { data: body, response } = await validateJsonRequest(request, categoryUpdateSchema);
    if (response) return response;
    if (!Object.keys(body).length) return NextResponse.json({ message: 'No category changes were provided.' }, { status: 400 });
    const payload = {};
    if (typeof body.name === 'string') payload.name = body.name;
    if (typeof body.slug === 'string' || body.name) payload.slug = slugify(body.slug || body.name);
    if (typeof body.image === 'string') payload.image = body.image;
    if (typeof body.type !== 'undefined') payload.type = body.type;
    if (typeof body.displayOrder !== 'undefined') payload.displayOrder = body.displayOrder;

    if (payload.name === '') return NextResponse.json({ message: 'Name cannot be empty.' }, { status: 400 });
    if (payload.slug === '') return NextResponse.json({ message: 'Slug cannot be empty.' }, { status: 400 });
    if (payload.type === undefined) delete payload.type;
    if ('displayOrder' in payload && !Number.isFinite(payload.displayOrder)) return NextResponse.json({ message: 'Display order must be a number.' }, { status: 400 });
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
    const category = await Category.findById(params.id).lean();
    if (!category) return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    const productCount = await Product.countDocuments({ category: category.name, type: category.type });
    if (productCount) {
      return NextResponse.json({ message: 'Move or delete this category\'s products before deleting it.' }, { status: 409 });
    }
    await Category.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Category deleted.' });
  } catch (error) {
    if (invalidId(error)) return NextResponse.json({ message: 'Invalid category id.' }, { status: 400 });
    console.error('Admin category delete error', error);
    return NextResponse.json({ message: 'Unable to delete category.' }, { status: 500 });
  }
}
