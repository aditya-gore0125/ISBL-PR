import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { applyRateLimit } from '@/lib/rateLimit';
import { newsletterSchema } from '@/lib/schemas';
import { validateJsonRequest } from '@/lib/validateRequest';
import Subscriber from '@/models/Subscriber';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const rateLimitResponse = await applyRateLimit(request, { route: 'newsletter', limit: 5, windowMs: 10 * 60 * 1000 });
  if (rateLimitResponse) return rateLimitResponse;

  const { data, response } = await validateJsonRequest(request, newsletterSchema);
  if (response) return response;
  const { email } = data;

  try {
    await connectToDatabase();
    await Subscriber.create({ email });
    return NextResponse.json({ message: 'You are on the list.' }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'This email is already subscribed.' }, { status: 409 });
    }
    console.error('Newsletter subscription error', error);
    return NextResponse.json({ message: 'Unable to subscribe right now.' }, { status: 500 });
  }
}