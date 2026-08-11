import Razorpay from 'razorpay';

/**
 * Production setup:
 * - Replace RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local with your live Razorpay credentials.
 * - Remove any test mode environment variables from your deployment.
 * - Ensure payment capture and webhook verification are configured for live orders.
 * - Keep the keys secret and never expose them in client code.
 */

export async function POST(request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return new Response(JSON.stringify({ message: 'Please define RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.' }), { status: 500 });
  }

  const razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const receipt = body.receipt || `receipt_${Date.now()}`;

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ message: 'Invalid payment amount.' }), { status: 400 });
    }

    const order = await razorpayClient.orders.create({
      amount,
      currency: 'INR',
      receipt,
      payment_capture: 1,
    });

    return new Response(JSON.stringify({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    }));
  } catch (error) {
    console.error('Razorpay create-order error', error);
    return new Response(JSON.stringify({ message: 'Unable to create Razorpay order.' }), { status: 500 });
  }
}
