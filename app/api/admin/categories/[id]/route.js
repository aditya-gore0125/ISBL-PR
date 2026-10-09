import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if ((!session?.user?.id || session.user.role !== 'admin') && process.env.NODE_ENV !== 'development') {
      return Response.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    await connectToDatabase();

    const category = await Category.findByIdAndUpdate(
      id,
      {
        name: body.name,
        slug: body.slug,
        type: body.type,
        image: body.image,
        displayOrder: Number(body.displayOrder || 0),
      },
      { new: true }
    );

    if (!category) {
      return Response.json({ message: 'Category not found.' }, { status: 404 });
    }

    return Response.json({ category });
  } catch (error) {
    console.error('Admin category PUT error', error);
    return Response.json({ message: error.message || 'Failed to update category.' }, { status: 500 });
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

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return Response.json({ message: 'Category not found.' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Admin category DELETE error', error);
    return Response.json({ message: error.message || 'Failed to delete category.' }, { status: 500 });
  }
}

