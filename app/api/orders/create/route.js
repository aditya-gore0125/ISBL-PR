import { createHmac, timingSafeEqual } from 'crypto';
import Razorpay from 'razorpay';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { applyRateLimit } from '@/lib/rateLimit';
import { createOrderSchema } from '@/lib/schemas';
import { validateJsonRequest } from '@/lib/validateRequest';
import { CheckoutCartError, getCheckoutPricing } from '@/lib/checkoutPricing';
import Order from '@/models/Order';
import Product from '@/models/Product';

function hasValidSignature(orderId, paymentId, signature, secret) {
  if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest();
  const received = Buffer.from(signature, 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function normalizeAddress(address) {
  if (!address || typeof address !== 'object' || Array.isArray(address)) return null;
  const fields = ['fullName', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'pincode'];
  if (Object.keys(address).some((key) => ![...fields, 'isDefault'].includes(key))) return null;

  const normalized = Object.fromEntries(fields.map((field) => [field, String(address[field] || '').trim()]));
  if (['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'].some((field) => !normalized[field])) return null;
  if (normalized.fullName.length > 100 || normalized.addressLine1.length > 200
    || normalized.addressLine2.length > 200 || normalized.city.length > 100 || normalized.state.length > 100
    || !/^[6-9]\d{9}$/.test(normalized.phone) || !/^[1-9][0-9]{5}$/.test(normalized.pincode)) return null;
  return normalized;
}

export async function POST(request) {
  const rateLimitResponse = await applyRateLimit(request, { route: 'orders-create', limit: 10, windowMs: 10 * 60 * 1000, failOpen: true });
  if (rateLimitResponse) return rateLimitResponse;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ message: 'Authentication required.' }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return Response.json({ message: 'Razorpay is not configured.' }, { status: 500 });
  }

  try {
    const { data: body, response } = await validateJsonRequest(request, createOrderSchema);
    if (response) return response;
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;
    const shippingAddress = normalizeAddress(body.shippingAddress);
    if (!shippingAddress) return Response.json({ message: 'Missing or invalid shipping address.' }, { status: 400 });
    if (!hasValidSignature(orderId, paymentId, signature, keySecret)) {
      return Response.json({ message: 'Payment signature is invalid.' }, { status: 400 });
    }

    await connectToDatabase();
    const razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const razorpayOrder = await razorpayClient.orders.fetch(orderId);
    if (razorpayOrder.notes?.userId !== session.user.id || razorpayOrder.currency !== 'INR') {
      return Response.json({ message: 'Payment order does not match this checkout.' }, { status: 400 });
    }

    const existingOrder = await Order.findOne({ razorpayOrderId: orderId });
    if (existingOrder) {
      if (existingOrder.user.toString() !== session.user.id) {
        return Response.json({ message: 'Payment order belongs to another user.' }, { status: 403 });
      }
      if (Number(razorpayOrder.amount) !== Math.round(Number(existingOrder.totalAmount) * 100)) {
        return Response.json({ message: 'Payment order amount does not match the saved order.' }, { status: 400 });
      }
      return Response.json({ order: existingOrder }, { status: 200 });
    }

    const pricing = await getCheckoutPricing(body.items);
    if (Number(razorpayOrder.amount) !== pricing.totalPaise) {
      return Response.json({ message: 'Payment order does not match this checkout.' }, { status: 400 });
    }

    const decrementedItems = [];
    const rollbackStock = async () => {
      let restored = true;
      for (const item of [...decrementedItems].reverse()) {
        const filter = item.size
          ? { _id: item.product, sizes: { $elemMatch: { size: item.size } } }
          : { _id: item.product };
        const update = item.size
          ? { $inc: { 'sizes.$.stock': item.quantity, stock: item.quantity } }
          : { $inc: { stock: item.quantity } };
        try {
          const result = await Product.updateOne(filter, update);
          if (result.modifiedCount === 1) continue;
          console.error('Order stock rollback could not restore product stock', {
            product: item.product.toString(),
            size: item.size,
          });
          restored = false;
        } catch (error) {
          console.error('Order stock rollback failed', error);
          restored = false;
        }
      }
      return restored;
    };

    const orderData = {
      user: session.user.id,
      razorpayOrderId: orderId,
      items: pricing.items.map(({ product, name, image, price, quantity, size }) => ({
        product,
        name,
        image,
        price,
        quantity,
        ...(size ? { size } : {}),
      })),
      shippingAddress,
      paymentId,
      paymentStatus: 'paid',
      totalAmount: pricing.total,
    };
    const createPendingReviewOrder = async () => {
      await rollbackStock();
      console.error('Paid order requires manual refund after stock decrement failure', {
        razorpayOrderId: orderId,
      });
      const order = await Order.create({
        ...orderData,
        orderStatus: 'pending',
        needsReview: true,
      });
      return Response.json({ order }, { status: 201 });
    };

    for (const item of pricing.items) {
      const filter = item.size
        ? {
            _id: item.product,
            'sizes.size': item.size,
            'sizes.stock': { $gte: item.quantity },
            sizes: { $elemMatch: { size: item.size, stock: { $gte: item.quantity } } },
          }
        : { _id: item.product, stock: { $gte: item.quantity } };
      const update = item.size
        ? { $inc: { 'sizes.$.stock': -item.quantity, stock: -item.quantity } }
        : { $inc: { stock: -item.quantity } };
      let result;
      try {
        result = await Product.updateOne(filter, update);
      } catch {
        return await createPendingReviewOrder();
      }
      if (result.modifiedCount !== 1) {
        return await createPendingReviewOrder();
      }
      decrementedItems.push(item);
    }

    let order;
    try {
      order = await Order.create({
        ...orderData,
        orderStatus: 'confirmed',
        needsReview: false,
      });
    } catch (error) {
      if (error.code === 11000) {
        const duplicate = await Order.findOne({ razorpayOrderId: orderId });
        if (duplicate?.user.toString() === session.user.id) {
          await rollbackStock();
          return Response.json({ order: duplicate }, { status: 200 });
        }
      }
      await rollbackStock();
      throw error;
    }

    return Response.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof CheckoutCartError) {
      return Response.json({ message: error.message }, { status: error.status });
    }
    console.error('Create order error', error);
    return Response.json({ message: 'Unable to verify and save order.' }, { status: 500 });
  }
}