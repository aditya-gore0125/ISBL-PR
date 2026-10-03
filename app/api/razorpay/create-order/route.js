import Razorpay from 'razorpay';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { CheckoutCartError, getCheckoutPricing } from '@/lib/checkoutPricing';

/**
 * Production setup:
 * - Replace RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local with your live Razorpay credentials.
 * - Remove any test mode environment variables from your deployment.
 * - Ensure payment capture and webhook verification are configured for live orders.
 * - Keep the keys secret and never expose them in client code.
 */

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ message: 'Authentication required.' }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return new Response(JSON.stringify({ message: 'Please define RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.' }), { status: 500 });
  }

  const razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)
      || Object.keys(body).some((key) => key !== 'items')) {
      return Response.json({ message: 'Invalid checkout payload.' }, { status: 400 });
    }

    await connectToDatabase();
    const pricing = await getCheckoutPricing(body.items);
    const order = await razorpayClient.orders.create({
      amount: pricing.totalPaise,
      currency: 'INR',
      receipt: `checkout_${Date.now()}`,
      payment_capture: 1,
      notes: { userId: session.user.id },
    });

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
      serverTotal: pricing.total,
    });
  } catch (error) {
    if (error instanceof CheckoutCartError) {
      return Response.json({ message: error.message }, { status: error.status });
    }
    console.error('Razorpay create-order error', error);
    return Response.json({ message: 'Unable to create Razorpay order.' }, { status: 500 });
  }
}
