import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
  }

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