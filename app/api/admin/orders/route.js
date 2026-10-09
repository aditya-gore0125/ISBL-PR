import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { escapeRegExp } from '@/lib/utils';
import { requireAdmin } from '@/lib/requireAdmin';
import Order from '@/models/Order';
import User from '@/models/User';

const orderStatuses = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
];
const paymentStatuses = ['pending', 'paid', 'failed'];
const sortOptions = {
  'createdAt': { createdAt: 1, _id: 1 },
  '-createdAt': { createdAt: -1, _id: -1 },
  'totalAmount': { totalAmount: 1, _id: 1 },
  '-totalAmount': { totalAmount: -1, _id: -1 },
  'orderStatus': { orderStatus: 1, _id: 1 },
  '-orderStatus': { orderStatus: -1, _id: -1 },
  'paymentStatus': { paymentStatus: 1, _id: 1 },
  '-paymentStatus': { paymentStatus: -1, _id: -1 },
};

function serializeOrder(order) {
  return {
    ...order,
    _id: order._id.toString(),
    user: order.user
      ? {
          ...order.user,
          _id: order.user._id.toString(),
        }
      : null,
    createdAt: order.createdAt?.toISOString() || null,
    updatedAt: order.updatedAt?.toISOString() || null,
  };
}

export async function GET(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const params = request.nextUrl.searchParams;
    const status = params.get('status') || '';
    const paymentStatus = params.get('paymentStatus') || '';
    const search = (params.get('q') || '').trim().slice(0, 100);
    const sort = params.get('sort') || '-createdAt';
    const requestedPage = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(params.get('limit') || '20', 10) || 20));

    if (status && !orderStatuses.includes(status)) {
      return NextResponse.json({ message: 'Order status filter is invalid.' }, { status: 400 });
    }
    if (paymentStatus && !paymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({ message: 'Payment status filter is invalid.' }, { status: 400 });
    }
    if (!sortOptions[sort]) {
      return NextResponse.json({ message: 'Sort option is invalid.' }, { status: 400 });
    }

    const filter = {};
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (search) {
      const expression = new RegExp(escapeRegExp(search), 'i');
      const matchingUsers = await User.find({
        $or: [{ name: expression }, { email: expression }, { phone: expression }],
      }).select('_id').limit(100).lean();
      const orderIdSearch = search.replace(/^#/, '');
      const matches = [
        { user: { $in: matchingUsers.map((user) => user._id) } },
        { $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: escapeRegExp(orderIdSearch), options: 'i' } } },
      ];
      filter.$or = matches;
    }

    const total = await Order.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);
    const orders = await Order.find(filter)
      .sort(sortOptions[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email phone')
      .lean();

    return NextResponse.json({
      orders: orders.map(serializeOrder),
      total,
      page,
      pages,
    });
  } catch (error) {
    console.error('Admin order list error', error);
    return NextResponse.json({ message: 'Unable to load orders.' }, { status: 500 });
  }
}