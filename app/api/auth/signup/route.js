import { hash } from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import { applyRateLimit } from '@/lib/rateLimit';
import { signupSchema } from '@/lib/schemas';
import { validateJsonRequest } from '@/lib/validateRequest';
import User from '@/models/User';

export async function POST(request) {
  const rateLimitResponse = await applyRateLimit(request, { route: 'signup', limit: 5, windowMs: 10 * 60 * 1000 });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { data, response } = await validateJsonRequest(request, signupSchema);
    if (response) return response;
    const { name, email, password, phone } = data;

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
