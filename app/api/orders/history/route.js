import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    await connectToDatabase();
    const orders = await Order.find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      orders: orders.map((order) => ({
        ...order,
        _id: order._id.toString(),
        user: order.user ? order.user.toString() : null,
        items: order.items || [],
      })),
    });
  } catch (error) {
    console.error('Order history error', error);
    return Response.json({ message: 'Unable to load order history.' }, { status: 500 });
  }
}
