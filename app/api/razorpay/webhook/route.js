import { createHmac, timingSafeEqual } from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

function isValidWebhookSignature(body, signature, secret) {
  if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(body).digest();
  const received = Buffer.from(signature, 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ message: 'Webhook is not configured.' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('x-razorpay-signature');
  if (!isValidWebhookSignature(body, signature, secret)) {
    return Response.json({ message: 'Invalid webhook signature.' }, { status: 400 });
  }

  try {
    const event = JSON.parse(body);
    const payment = event.payload?.payment?.entity;
    if (!payment?.order_id || !['payment.captured', 'payment.failed'].includes(event.event)) {
      return Response.json({ received: true });
    }

    await connectToDatabase();
    if (event.event === 'payment.captured') {
      await Order.updateOne(
        { razorpayOrderId: payment.order_id },
        { $set: { paymentStatus: 'paid', paymentId: payment.id } }
      );
    } else {
      await Order.updateOne(
        { razorpayOrderId: payment.order_id, paymentStatus: { $ne: 'paid' } },
        { $set: { paymentStatus: 'failed', paymentId: payment.id } }
      );
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error', error);
    return Response.json({ message: 'Unable to process webhook.' }, { status: 500 });
  }
}