import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: 'Authentication required.' }), { status: 401 });
    }

    const body = await request.json();
    const { orderId, paymentId, signature, shippingAddress, items, totalAmount } = body;

    if (!orderId || !paymentId || !shippingAddress || !items || !items.length) {
      return new Response(JSON.stringify({ message: 'Missing order payload.' }), { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found.' }), { status: 404 });
    }

    const order = await Order.create({
      user: user._id,
      items: items.map((item) => ({
        product: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      shippingAddress,
      paymentId,
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      totalAmount,
    });

    return new Response(JSON.stringify({ order }), { status: 201 });
  } catch (error) {
    console.error('Create order error', error);
    return new Response(JSON.stringify({ message: 'Unable to save order.' }), { status: 500 });
  }
}
