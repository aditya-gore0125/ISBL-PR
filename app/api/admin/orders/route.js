import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((!session?.user?.id || session.user.role !== 'admin') && process.env.NODE_ENV !== 'development') {
      return Response.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await connectToDatabase();
    const orders = await Order.find({})
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({ orders });
  } catch (error) {
    console.error('Admin orders GET error', error);
    return Response.json({ message: 'Failed to load orders.' }, { status: 500 });
  }
}

