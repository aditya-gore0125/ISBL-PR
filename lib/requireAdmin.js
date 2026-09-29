import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ message: 'Authentication required.' }, { status: 401 }),
    };
  }

  if (!session.user?.id) {
    return {
      session: null,
      response: NextResponse.json({ message: 'Admin access required.' }, { status: 403 }),
    };
  }

  await connectToDatabase();
  const user = await User.findById(session.user.id).select('role').lean();

  if (user?.role !== 'admin') {
    return {
      session: null,
      response: NextResponse.json({ message: 'Admin access required.' }, { status: 403 }),
    };
  }

  return { session, response: null };
}
