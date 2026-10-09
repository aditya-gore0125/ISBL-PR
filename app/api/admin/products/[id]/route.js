import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await Promise.resolve(params);
    await connectToDatabase();

    const product = await Product.findById(id).lean();
    if (!product) {
      return Response.json({ message: 'Product not found.' }, { status: 404 });
    }

    return Response.json({ product });
  } catch (error) {
    console.error('Admin product GET error', error);
    return Response.json({ message: 'Failed to load product.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if ((!session?.user?.id || session.user.role !== 'admin') && process.env.NODE_ENV !== 'development') {
      return Response.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    await connectToDatabase();

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name: body.name,
        slug: body.slug,
        category: body.category,
        description: body.description,
        material: body.material,
        price: Number(body.price),
        discountPrice: body.discountPrice ? Number(body.discountPrice) : null,
        images: Array.isArray(body.images) ? body.images : [],
        stock: Number(body.stock || 0),
        isFeatured: Boolean(body.isFeatured),
        isNewArrival: Boolean(body.isNewArrival),
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
      },
      { new: true }
    );

    if (!product) {
      return Response.json({ message: 'Product not found.' }, { status: 404 });
    }

    return Response.json({ product });
  } catch (error) {
    console.error('Admin product PUT error', error);
    return Response.json({ message: error.message || 'Failed to update product.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if ((!session?.user?.id || session.user.role !== 'admin') && process.env.NODE_ENV !== 'development') {
      return Response.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    await connectToDatabase();

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return Response.json({ message: 'Product not found.' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Admin product DELETE error', error);
    return Response.json({ message: error.message || 'Failed to delete product.' }, { status: 500 });
  }
}

