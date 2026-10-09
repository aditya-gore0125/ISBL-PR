import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id).select('-password').lean();

    if (!user) {
      return Response.json({ message: 'User not found.' }, { status: 404 });
    }

    return Response.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    console.error('Account GET error', error);
    return Response.json({ message: 'Failed to fetch account.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();

    const updates = {};

    if (body.profile) {
      if (typeof body.profile.name === 'string') {
        updates.name = body.profile.name.trim();
      }
      if (typeof body.profile.phone === 'string') {
        updates.phone = body.profile.phone.trim();
      }
    }

    if (Array.isArray(body.addresses)) {
      updates.addresses = body.addresses;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select('-password')
      .lean();

    if (!updatedUser) {
      return Response.json({ message: 'User not found.' }, { status: 404 });
    }

    return Response.json({
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        addresses: updatedUser.addresses || [],
      },
    });
  } catch (error) {
    console.error('Account PUT error', error);
    return Response.json({ message: error.message || 'Failed to update account.' }, { status: 500 });
  }
}

