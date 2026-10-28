import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/requireAdmin';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    await connectToDatabase();
    const category = await Category.findById(id).lean();
    if (!category) {
      return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    }

    // Matching rule: product.category === category.name AND product.type === category.type
    const products = await Product.find({
      category: category.name,
      type: category.type,
    })
      .select('name price discountPrice stock images slug')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        type: category.type,
      },
      products,
    });
  } catch (error) {
    console.error('Admin category products error', error);
    return NextResponse.json({ message: 'Unable to load products.' }, { status: 500 });
  }
}

