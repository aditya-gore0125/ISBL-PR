import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({}).sort({ displayOrder: 1, name: 1 }).lean();
    return Response.json({ categories });
  } catch (error) {
    console.error('Admin categories GET error', error);
    return Response.json({ message: 'Failed to load categories.' }, { status: 500 });
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

    const category = await Category.create({
      name: body.name,
      slug: body.slug,
      type: body.type || 'Ladies',
      image: body.image || '',
      displayOrder: Number(body.displayOrder || 0),
    });

    return Response.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Admin categories POST error', error);
    return Response.json({ message: error.message || 'Failed to create category.' }, { status: 500 });
  }
}

