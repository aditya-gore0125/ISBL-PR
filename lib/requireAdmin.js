import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ message: 'Authentication required.' }, { status: 401 }),
    };
  }

  if (session.user?.role !== 'admin') {
    return {
      session: null,
      response: NextResponse.json({ message: 'Admin access required.' }, { status: 403 }),
    };
  }

  return { session, response: null };
}
