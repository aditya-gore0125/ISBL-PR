import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if ((!session?.user?.id || session.user.role !== 'admin') && process.env.NODE_ENV !== 'development') {
      return Response.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    await connectToDatabase();

    const order = await Order.findById(id).populate('user', 'name email phone').lean();
    if (!order) {
      return Response.json({ message: 'Order not found.' }, { status: 404 });
    }

    return Response.json({ order });
  } catch (error) {
    console.error('Admin order GET error', error);
    return Response.json({ message: 'Failed to load order.' }, { status: 500 });
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

    const updates = {};
    if (body.orderStatus) updates.orderStatus = body.orderStatus;
    if (body.paymentStatus) updates.paymentStatus = body.paymentStatus;
    if (body.trackingId !== undefined) updates.trackingId = body.trackingId;
    if (body.courierPartner !== undefined) updates.courierPartner = body.courierPartner;

    const order = await Order.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate('user', 'name email phone')
      .lean();

    if (!order) {
      return Response.json({ message: 'Order not found.' }, { status: 404 });
    }

    return Response.json({ order });
  } catch (error) {
    console.error('Admin order PUT error', error);
    return Response.json({ message: error.message || 'Failed to update order.' }, { status: 500 });
  }
}

