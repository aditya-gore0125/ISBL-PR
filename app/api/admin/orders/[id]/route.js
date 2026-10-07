import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { requireAdmin } from '@/lib/requireAdmin';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { adminOrderUpdateSchema } from '@/lib/schemas';
import { validateJsonRequest } from '@/lib/validateRequest';

const orderPipeline = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
const exceptionStatuses = ['cancelled', 'returned'];
const orderStatuses = Order.schema.path('orderStatus').enumValues;

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

function invalidId(error) {
  return error?.name === 'CastError';
}

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const order = await Order.findById(params.id).populate('user', 'name email phone').lean();
    if (!order) return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    if (invalidId(error)) return NextResponse.json({ message: 'Invalid order id.' }, { status: 400 });
    console.error('Admin order get error', error);
    return NextResponse.json({ message: 'Unable to load order.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { data: body, response } = await validateJsonRequest(request, adminOrderUpdateSchema);
    if (response) return response;
    const { orderStatus } = body;

    await connectToDatabase();
    const currentOrder = await Order.findById(params.id);
    if (!currentOrder) return NextResponse.json({ message: 'Order not found.' }, { status: 404 });

    const currentStatus = currentOrder.orderStatus || 'pending';
    const currentIndex = orderPipeline.indexOf(currentStatus);
    const nextIndex = orderPipeline.indexOf(orderStatus);
    if (!exceptionStatuses.includes(orderStatus) && (currentIndex < 0 || nextIndex < currentIndex)) {
      return NextResponse.json({ message: 'Order status can only move forward.' }, { status: 400 });
    }

    const trackingId = (body.trackingId ?? currentOrder.trackingId ?? '').trim().slice(0, 100);
    const courierPartner = (body.courierPartner ?? currentOrder.courierPartner ?? '').trim().slice(0, 80);
    const requiresShippingDetails = nextIndex >= orderPipeline.indexOf('shipped');
    if (requiresShippingDetails && (!trackingId || !courierPartner)) {
      return NextResponse.json({ message: 'Tracking ID and courier partner are required from shipped onward.' }, { status: 400 });
    }

    const shouldRestoreStock = exceptionStatuses.includes(orderStatus)
      && !exceptionStatuses.includes(currentStatus)
      && currentOrder.paymentStatus === 'paid'
      && currentOrder.stockRestored !== true;
    const update = {
      $set: {
        orderStatus,
        trackingId,
        courierPartner,
        ...(shouldRestoreStock ? { stockRestored: true } : {}),
      },
    };
    const updateFilter = { _id: params.id, orderStatus: currentStatus };
    if (shouldRestoreStock) updateFilter.stockRestored = { $ne: true };

    const session = await mongoose.startSession();
    let updatedOrder;
    try {
      await session.withTransaction(async () => {
        updatedOrder = await Order.findOneAndUpdate(updateFilter, update, {
          new: true,
          runValidators: true,
          session,
        }).populate('user', 'name email phone').lean();
        if (!updatedOrder || !shouldRestoreStock) return;

        for (const item of updatedOrder.items.filter((entry) => entry.product && Number(entry.quantity) > 0)) {
          const filter = item.size
            ? { _id: item.product, 'sizes.size': item.size }
            : { _id: item.product };
          const update = item.size
            ? { $inc: { 'sizes.$.stock': Number(item.quantity), stock: Number(item.quantity) } }
            : { $inc: { stock: Number(item.quantity) } };
          const result = await Product.updateOne(filter, update, { session });
          if (result.modifiedCount !== 1) {
            const error = new Error(`Stock for ${item.name}${item.size ? ` size ${item.size}` : ''} could not be restored.`);
            error.code = 'ORDER_PRODUCT_MISSING';
            throw error;
          }
        }
      });
    } finally {
      await session.endSession();
    }

    if (!updatedOrder) {
      return NextResponse.json({ message: 'Order changed while you were editing it. Reload and try again.' }, { status: 409 });
    }

    return NextResponse.json({ order: serializeOrder(updatedOrder) });
  } catch (error) {
    if (error.code === 'ORDER_PRODUCT_MISSING') return NextResponse.json({ message: error.message }, { status: 409 });
    if (invalidId(error)) return NextResponse.json({ message: 'Invalid order id.' }, { status: 400 });
    if (error instanceof SyntaxError) return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 });
    if (error.name === 'ValidationError') return NextResponse.json({ message: error.message }, { status: 400 });
    console.error('Admin order update error', error);
    return NextResponse.json({ message: 'Unable to update order.' }, { status: 500 });
  }
}