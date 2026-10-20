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
import { finalizeOrderPayment } from '@/lib/orderFinalize';

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
        await Order.updateOne({ _id: existingOrder._id }, { $set: { needsReview: true } });
        return Response.json({ message: 'Payment order amount does not match the saved order.' }, { status: 400 });
      }

      const result = await finalizeOrderPayment({
        order: existingOrder,
        paymentId,
        paidAmountPaise: razorpayOrder.amount,
        shippingAddress,
      });

      if (!result.success && result.reason === 'amount_mismatch') {
        return Response.json({ message: 'Payment order amount does not match the saved order.' }, { status: 400 });
      }

      return Response.json(
        { order: result.order || existingOrder },
        { status: result.alreadyFinalized ? 200 : 201 }
      );
    }

    // Fallback if pending order wasn't created at /api/razorpay/create-order
    const pricing = await getCheckoutPricing(body.items);
    if (Number(razorpayOrder.amount) !== pricing.totalPaise) {
      return Response.json({ message: 'Payment order does not match this checkout.' }, { status: 400 });
    }

    let newOrder;
    try {
      newOrder = await Order.create({
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
        totalAmount: pricing.total,
        orderStatus: 'pending',
        paymentStatus: 'pending',
      });
    } catch (error) {
      if (error.code === 11000) {
        const duplicate = await Order.findOne({ razorpayOrderId: orderId });
        if (duplicate?.user.toString() === session.user.id) {
          const result = await finalizeOrderPayment({
            order: duplicate,
            paymentId,
            paidAmountPaise: razorpayOrder.amount,
            shippingAddress,
          });
          return Response.json({ order: result.order || duplicate }, { status: 200 });
        }
      }
      throw error;
    }

    const result = await finalizeOrderPayment({
      order: newOrder,
      paymentId,
      paidAmountPaise: razorpayOrder.amount,
      shippingAddress,
    });

    if (!result.success && result.reason === 'amount_mismatch') {
      return Response.json({ message: 'Payment order amount does not match the saved order.' }, { status: 400 });
    }

    return Response.json({ order: result.order || newOrder }, { status: 201 });
  } catch (error) {
    if (error instanceof CheckoutCartError) {
      return Response.json({ message: error.message }, { status: error.status });
    }
    console.error('Create order error', error);
    return Response.json({ message: 'Unable to verify and save order.' }, { status: 500 });
  }
}
