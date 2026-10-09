import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return Response.json({ products });
  } catch (error) {
    console.error('Admin products GET error', error);
    return Response.json({ message: 'Failed to load products.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if ((!session?.user?.id || session.user.role !== 'admin') && process.env.NODE_ENV !== 'development') {
      return Response.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();

    const product = await Product.create({
      name: body.name,
      slug: body.slug,
      category: body.category,
      description: body.description,
      material: body.material,
      price: Number(body.price),
      discountPrice: body.discountPrice ? Number(body.discountPrice) : undefined,
      images: Array.isArray(body.images) ? body.images : [],
      stock: Number(body.stock || 0),
      isFeatured: Boolean(body.isFeatured),
      isNewArrival: Boolean(body.isNewArrival),
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
    });

    return Response.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Admin products POST error', error);
    return Response.json({ message: error.message || 'Failed to create product.' }, { status: 500 });
  }
}

