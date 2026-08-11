import { hash } from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const phone = String(body?.phone || '').trim();

    if (!name || !email || !password) {
      return Response.json({ message: 'Name, email, and password are required.' }, { status: 400 });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return Response.json({ message: 'Enter a valid email address.' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ message: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return Response.json({ message: 'This email is already registered.' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || undefined,
      role: 'customer',
    });

    return Response.json(
      {
        message: 'Account created successfully.',
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error', error);
    return Response.json({ message: 'Unable to create account right now.' }, { status: 500 });
  }
}
