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

    const validAddress = shippingAddress && typeof shippingAddress === 'object'
      && ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'].every((key) => String(shippingAddress[key] || '').trim())
      && /^[6-9]\d{9}$/.test(String(shippingAddress.phone))
      && /^[1-9][0-9]{5}$/.test(String(shippingAddress.pincode));
    const validItems = Array.isArray(items) && items.length > 0 && items.length <= 50 && items.every((item) => (
      item && item.productId && String(item.name || '').trim() && Number.isFinite(Number(item.price))
      && Number(item.price) >= 0 && Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0 && Number(item.quantity) <= 20
    ));
    const validTotal = Number.isFinite(Number(totalAmount)) && Number(totalAmount) > 0 && Number(totalAmount) < 100000000;

    if (!orderId || String(orderId).length > 100 || !paymentId || String(paymentId).length > 200 || !validAddress || !validItems || !validTotal) {
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
      totalAmount: Number(totalAmount),
    });

    return new Response(JSON.stringify({ order }), { status: 201 });
  } catch (error) {
    console.error('Create order error', error);
    return new Response(JSON.stringify({ message: 'Unable to save order.' }), { status: 500 });
  }
}
