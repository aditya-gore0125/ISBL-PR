import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { accountSchema } from '@/lib/schemas';
import { validateJsonRequest } from '@/lib/validateRequest';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    addresses: user.addresses || [],
  };
}

async function getAuthenticatedSession() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? session : null;
}

export async function GET() {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id).lean();

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    console.error('Account GET error', error);
    return NextResponse.json({ message: 'Unable to load account right now.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    const { data: body, response } = await validateJsonRequest(request, accountSchema);
    if (response) return response;

    const update = {};
    const unset = {};
    if (body?.profile !== undefined) {
      update.name = body.profile.name;
      if (body.profile.phone) {
        update.phone = body.profile.phone;
      } else {
        unset.phone = 1;
      }
    }

    if (body?.addresses !== undefined) {
      update.addresses = body.addresses;
    }

    if (!Object.keys(update).length && !Object.keys(unset).length) {
      return NextResponse.json({ message: 'No account changes were provided.' }, { status: 400 });
    }

    await connectToDatabase();

    if (body?.profile?.phone) {
      const duplicateUser = await User.findOne({
        phone: body.profile.phone,
        _id: { $ne: session.user.id },
      }).lean();
      if (duplicateUser) {
        return NextResponse.json({ message: "This phone number can't be used. Please check it or try a different one." }, { status: 409 });
      }
    }

    const updateOps = { $set: update };
    if (Object.keys(unset).length) {
      updateOps.$unset = unset;
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updateOps,
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Account updated successfully.', user: serializeUser(user) });
  } catch (error) {
    if (error?.code === 11000) {
      if (error.keyPattern?.phone || (error.message && error.message.includes('phone'))) {
        return NextResponse.json({ message: "This phone number can't be used. Please check it or try a different one." }, { status: 409 });
      }
    }
    console.error('Account PUT error', error);
    return NextResponse.json({ message: 'Unable to update account right now.' }, { status: 500 });
  }
}

function methodNotAllowed() {
  return NextResponse.json({ message: 'Method not allowed.' }, { status: 405 });
}

export async function POST() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function OPTIONS() {
  return methodNotAllowed();
}
